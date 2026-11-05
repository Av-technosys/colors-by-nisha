import "server-only";

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, payment, users, orderItems, products, productVariants } from "@/lib/db/schema";
import { getRazorpayClient, razorpayKeyId } from "@/helpers/razorpay";
import { confirmOrderPayment, orderReference } from "@/helpers/orders/service";
import { isUuid, minorAmount, OrderInputError } from "@/helpers/orders/input";

export async function ownedPaymentOrder(orderId: string, clerkId: string) {
  if (!isUuid(orderId)) throw new OrderInputError("Invalid order reference.");
  const owner = db.select({ id: users.id }).from(users).where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)));
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), inArray(orders.userId, owner))).limit(1);
  if (!order) throw new OrderInputError("Order not found.");
  return order;
}

export async function settleGatewayPayment(entity: { id: string; order_id?: string; amount: number | string; currency: string; status: string; method?: string }) {
  if (entity.status !== "captured" || !entity.order_id) throw new OrderInputError("Payment is not captured yet.");
  const [attempt] = await db.select().from(payment).where(eq(payment.paymentOrderId, entity.order_id)).orderBy(desc(payment.createdAt)).limit(1);
  if (!attempt?.orderId) throw new Error("The payment attempt is not saved yet. Retry confirmation shortly.");
  if (attempt.paymentAmount !== Number(entity.amount) || entity.currency !== "INR") throw new OrderInputError("Payment amount or currency does not match the saved payment attempt.");
  return confirmOrderPayment({ orderId: attempt.orderId, paymentId: entity.id, amountMinor: Number(entity.amount), currency: entity.currency, paymentOrderId: entity.order_id, paymentMethod: entity.method });
}

export async function reconcileOrderPayment(orderId: string, clerkId: string) {
  const order = await ownedPaymentOrder(orderId, clerkId);
  if (order.paidAt) return { paid: true, status: order.status, requiresAttention: !order.stockDeductedAt || order.status === "cancelled" };
  const [attempt] = await db.select().from(payment).where(eq(payment.orderId, orderId)).orderBy(desc(payment.createdAt)).limit(1);
  if (attempt?.paymentOrderId) {
    const result = await getRazorpayClient().orders.fetchPayments(attempt.paymentOrderId);
    const captured = result.items.find(item => item.status === "captured");
    if (captured) {
      const settled = await settleGatewayPayment(captured);
      return { paid: true, status: settled.order.status, requiresAttention: settled.requiresAttention };
    }
  }
  return { paid: false, status: order.status, requiresAttention: false };
}

export async function prepareOrderPayment(orderId: string, clerkId: string) {
  if (!isUuid(orderId)) throw new OrderInputError("Invalid order reference.");
  const owner = db.select({ id: users.id }).from(users).where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)));
  const prepared = await db.transaction(async tx => {
    const [order] = await tx.select().from(orders).where(and(eq(orders.id, orderId), inArray(orders.userId, owner))).for("update");
    if (!order) throw new OrderInputError("Order not found.");
    if (order.paidAt) return { paid: true as const, order };
    if (order.status !== "pending") throw new OrderInputError("This order is no longer available for payment.");
    const amount = minorAmount(order.totalAmount);
    if (amount <= 0) throw new OrderInputError("This order is not available for payment. Please review your cart.");
    async function checkAvailability() {
      const items = await tx.select({
        productId: products.id, status: products.status, variantId: orderItems.variantId, savedVariantId: productVariants.id,
        quantity: orderItems.quantity, stock: productVariants.stock,
        hasVariants: sql<boolean>`exists(select 1 from ${productVariants} where ${productVariants.productId} = ${orderItems.productId})`,
      }).from(orderItems).leftJoin(products, eq(products.id, orderItems.productId)).leftJoin(productVariants, and(eq(productVariants.id, orderItems.variantId), eq(productVariants.productId, orderItems.productId))).where(eq(orderItems.orderId, order.id));
      if (!items.length || items.some(item => !item.productId || item.status !== "active" || (item.variantId ? !item.savedVariantId : item.hasVariants))) throw new OrderInputError("An item is no longer available. Please review your cart before paying.");
      const quantities = new Map<string, number>();
      for (const item of items) if (item.variantId) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
      if (items.some(item => item.variantId && item.stock !== null && quantities.get(item.variantId)! > item.stock)) throw new OrderInputError("An item has sold out or has fewer pieces available. Please review your cart before paying.");
    }
    const [attempt] = await tx.select().from(payment).where(eq(payment.orderId, order.id)).orderBy(desc(payment.createdAt)).limit(1);
    if (attempt?.paymentOrderId) {
      const gateway = await getRazorpayClient().orders.fetch(attempt.paymentOrderId);
      if (Number(gateway.amount) !== amount || gateway.currency !== "INR") throw new OrderInputError("Saved payment amount does not match this order.");
      if (gateway.status !== "paid") await checkAvailability();
      return { paid: false as const, order, gateway };
    }
    await checkAvailability();
    const gateway = await getRazorpayClient().orders.create({ amount, currency: "INR", receipt: `CBN-${order.id.replaceAll("-", "")}`, notes: { orderId: order.id } });
    await tx.insert(payment).values({ orderId: order.id, paymentOrderId: gateway.id, paymentAmount: amount, paymentStatus: "pending" });
    return { paid: false as const, order, gateway };
  });
  if (prepared.paid) return { paid: true, orderId };
  if (prepared.gateway.status === "paid") return { ...await reconcileOrderPayment(orderId, clerkId), orderId };
  return {
    paid: false, keyId: razorpayKeyId(), orderId, orderReference: orderReference(orderId),
    razorpayOrderId: prepared.gateway.id, amount: Number(prepared.gateway.amount), currency: prepared.gateway.currency,
    customer: { name: prepared.order.shippingName || "", phone: prepared.order.shippingPhone || "" },
  };
}
