import "server-only";

import { revalidatePath } from "next/cache";

import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, productMedia, users } from "@/lib/db/schema";
import { imageUrl } from "@/helpers/storage/s3";
import { decimalAmount, isUuid, minorAmount, nextStatuses, orderStatuses, OrderInputError, parseOrderLines, type CartQuote, type parseDelivery } from "./input";

export async function quoteCart(input: unknown): Promise<CartQuote> {
  const lines = parseOrderLines(input);
  const catalog = await db.query.products.findMany({
    where: inArray(products.slug, [...new Set(lines.map(item => item.slug))]),
    with: { variants: true, media: { orderBy: [asc(productMedia.position), asc(productMedia.id)] } },
  });
  const quantities = new Map<string, number>();
  const items = await Promise.all(lines.map(async line => {
    const product = catalog.find(item => item.slug === line.slug);
    if (!product || product.status !== "active") throw new OrderInputError("An item is no longer available. Please review your cart.");
    const variant = product.variants.find(item => item.id === line.variantId);
    if ((product.variants.length > 0 || line.variantId) && !variant) throw new OrderInputError(`Please choose an available option for ${product.name} on its product page.`);
    if (variant) {
      const quantity = (quantities.get(variant.id) ?? 0) + line.quantity;
      quantities.set(variant.id, quantity);
      if (variant.stock !== null && quantity > variant.stock) throw new OrderInputError(`Not enough stock for ${product.name} (${variant.name}). Please update your cart.`);
    }
    const price = variant?.price ?? product.price;
    if (minorAmount(price) <= 0) throw new OrderInputError(`${product.name} is unavailable for checkout.`);
    const media = product.media.find(item => variant && item.variantId === variant.id) ?? product.media.find(item => !item.variantId) ?? product.media[0];
    return {
      ...line, productId: product.id, name: product.name, price, sku: variant?.sku ?? product.sku,
      imageKey: media?.key ?? null, image: media ? await imageUrl(media.key).catch(() => "/product-placeholder.svg") : "/product-placeholder.svg",
    };
  }));
  return { items, subtotal: decimalAmount(items.reduce((sum, item) => sum + minorAmount(item.price) * item.quantity, 0)) };
}

export async function placeOrder(userId: string, input: Record<string, unknown>, address: { fullName: string; phone: string; address: string; apartment: string; city: string; state: string; pinCode: string }) {
  if (!isUuid(input.id)) throw new OrderInputError("Please refresh checkout and try again.");
  if (input.acceptedTerms !== true) throw new OrderInputError("Please accept the terms and conditions.");
  const existing = await db.query.orders.findFirst({ where: eq(orders.id, input.id), columns: { id: true, userId: true } });
  if (existing) {
    if (existing.userId !== userId) throw new OrderInputError("Invalid order reference.");
    return existing.id;
  }
  const quote = await quoteCart(input.items);
  if (input.expectedSubtotal !== quote.subtotal) throw new OrderInputError("Prices have changed. Refresh your order summary before placing the order.");
  return db.transaction(async tx => {
    const [order] = await tx.insert(orders).values({
      id: input.id as string, userId, addressLine1: address.address, addressLine2: address.apartment || null,
      shippingName: address.fullName, shippingPhone: address.phone,
      city: address.city, state: address.state, pincode: address.pinCode,
      subtotalAmount: quote.subtotal, totalAmount: quote.subtotal,
    }).onConflictDoNothing({ target: orders.id }).returning({ id: orders.id, userId: orders.userId });
    if (!order) {
      const [retry] = await tx.select({ id: orders.id, userId: orders.userId }).from(orders).where(eq(orders.id, input.id as string));
      if (!retry || retry.userId !== userId) throw new OrderInputError("Invalid order reference.");
      return retry.id;
    }
    await tx.insert(orderItems).values(quote.items.map(item => ({
      orderId: order.id, productId: item.productId, variantId: item.variantId ?? null, size: item.size || null,
      quantity: item.quantity, productName: item.name, productSlug: item.slug,
      productImage: item.imageKey, productPrice: item.price, productSku: item.sku,
    })));
    return order.id;
  });
}

export async function getOrder(id: string, clerkId?: string) {
  if (!isUuid(id)) return null;
  const owner = clerkId ? db.select({ id: users.id }).from(users).where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt))) : undefined;
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), owner ? inArray(orders.userId, owner) : undefined),
    with: { user: { columns: { fullName: true, email: true, mobile: true } }, items: { orderBy: [asc(orderItems.id)] } },
  });
  if (!order) return null;
  return { ...order, items: await Promise.all(order.items.map(async item => ({ ...item, image: item.productImage ? await imageUrl(item.productImage).catch(() => "/product-placeholder.svg") : "/product-placeholder.svg" }))) };
}
export type OrderDetails = NonNullable<Awaited<ReturnType<typeof getOrder>>>;

export async function listOrders(input: { page?: string; query?: string; status?: string; clerkId?: string } = {}) {
  const page = Math.max(1, Math.min(10000, Number.parseInt(typeof input.page === "string" ? input.page : "1", 10) || 1));
  const search = (typeof input.query === "string" ? input.query : "").trim().slice(0, 100).replace(/^CBN-/i, "").replace(/[\\%_]/g, "\\$&");
  const status = orderStatuses.find(value => value === input.status);
  const where = and(
    input.clerkId ? and(eq(users.clerkId, input.clerkId), isNull(users.deletedAt)) : undefined,
    status ? eq(orders.status, status) : undefined,
    search ? or(ilike(sql<string>`${orders.id}::text`, `%${search}%`), ilike(users.fullName, `%${search}%`), ilike(users.email, `%${search}%`)) : undefined,
  );
  const rows = await db.select({
    id: orders.id, status: orders.status, totalAmount: orders.totalAmount, createdAt: orders.createdAt,
    customerName: users.fullName, customerEmail: users.email, totalCount: sql<number>`count(*) over()::int`,
  }).from(orders).leftJoin(users, eq(orders.userId, users.id)).where(where)
    .orderBy(desc(orders.createdAt), desc(orders.id)).limit(20).offset((page - 1) * 20);
  let total = rows[0]?.totalCount ?? 0;
  if (!rows.length && page > 1) {
    const [count] = await db.select({ total: sql<number>`count(*)::int` }).from(orders).leftJoin(users, eq(orders.userId, users.id)).where(where);
    total = count.total;
  }
  return { rows, page, total, pageCount: Math.max(1, Math.ceil(total / 20)) };
}

type OrderTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function changeOrderStock(tx: OrderTransaction, orderId: string, restore: boolean) {
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  if (!restore && (!items.length || items.some(item => !item.productId))) return "A purchased product was removed. Review the order before processing.";
  const quantities = new Map<string, number>();
  for (const item of items) if (item.variantId) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  const ids = [...quantities.keys()].sort();
  if (!ids.length) return null;
  const variants = await tx.select().from(productVariants).where(inArray(productVariants.id, ids)).orderBy(asc(productVariants.id)).for("update");
  if (!restore && (variants.length !== ids.length || variants.some(variant => variant.stock !== null && variant.stock < quantities.get(variant.id)!))) return "Payment received, but stock is insufficient. Replenish stock before processing this order.";
  const tracked = variants.filter(variant => variant.stock !== null);
  if (tracked.length) {
    const changes = sql.join(tracked.map(variant => sql`(${variant.id}::uuid, ${quantities.get(variant.id)!}::integer)`), sql`, `);
    await tx.execute(sql`UPDATE ${productVariants} SET stock = stock ${restore ? sql`+` : sql`-`} change.quantity FROM (VALUES ${changes}) AS change(id, quantity) WHERE ${productVariants.id} = change.id`);
  }
  return null;
}

// Verified payments only
export async function confirmOrderPayment(input: { orderId: string; paymentId: string; amountMinor: number; currency: string }) {
  if (!isUuid(input.orderId) || !/^[a-zA-Z0-9_-]{5,100}$/.test(input.paymentId)) throw new OrderInputError("Invalid payment reference.");
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0 || input.currency !== "INR") throw new OrderInputError("Invalid payment amount or currency.");
  const result = await db.transaction(async tx => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, input.orderId)).for("update");
    if (!order) throw new OrderInputError("Order not found.");
    if (minorAmount(order.totalAmount) !== input.amountMinor) throw new OrderInputError("The payment amount does not match this order.");
    if (order.paymentId && order.paymentId !== input.paymentId) throw new OrderInputError("This order already has a different payment.");
    if (order.paidAt && (order.stockDeductedAt || order.status === "cancelled")) return { order, requiresAttention: order.status === "cancelled", issue: order.status === "cancelled" ? "Review the cancelled order for a payment refund." : null };
    const issue = order.status === "cancelled" ? "Payment received after cancellation. Review and refund through the payment provider." : await changeOrderStock(tx, order.id, false);
    const now = new Date();
    const [updated] = await tx.update(orders).set({
      paymentId: input.paymentId, paidAt: order.paidAt ?? now,
      stockDeductedAt: issue ? null : now, status: issue ? order.status : "processing",
    }).where(eq(orders.id, order.id)).returning();
    return { order: updated, requiresAttention: Boolean(issue), issue };
  });
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${input.orderId}`);
  revalidatePath("/orders");
  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath("/shop");
  revalidatePath("/products/[handle]", "page");
  return result;
}

export async function updateOrder(id: string, values: ReturnType<typeof parseDelivery>, expectedUpdatedAt: string) {
  if (!isUuid(id)) throw new OrderInputError("Invalid order reference.");
  return db.transaction(async tx => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!order) throw new OrderInputError("Order not found.");
    if (order.updatedAt.toISOString() !== expectedUpdatedAt) throw new OrderInputError("This order was updated elsewhere. Refresh before saving.");
    if (order.status !== values.status && !nextStatuses(order.status).includes(values.status)) throw new OrderInputError("This status change is not allowed.");
    let stockDeductedAt = order.stockDeductedAt;
    if (order.status === "pending" && values.status === "processing") {
      if (!order.paidAt) throw new OrderInputError("Awaiting confirmed payment. Stock is deducted only after successful payment.");
      if (!stockDeductedAt) {
        const issue = await changeOrderStock(tx, order.id, false);
        if (issue) throw new OrderInputError(issue);
        stockDeductedAt = new Date();
      }
    }
    if (order.stockDeductedAt && ["processing", "packed"].includes(order.status) && values.status === "cancelled") await changeOrderStock(tx, order.id, true);
    if (["shipped", "out_for_delivery", "delivered"].includes(values.status) && (!values.courierName || !values.trackingNumber)) throw new OrderInputError("Add the courier and tracking number before dispatching.");
    const now = new Date();
    const [updated] = await tx.update(orders).set({
      ...values, stockDeductedAt, shippedAt: order.shippedAt ?? (["shipped", "out_for_delivery", "delivered"].includes(values.status) ? now : null),
      deliveredAt: order.deliveredAt ?? (values.status === "delivered" ? now : null),
    }).where(eq(orders.id, order.id)).returning();
    return updated;
  });
}

export function orderReference(id: string) { return `CBN-${id.slice(0, 8).toUpperCase()}`; }
