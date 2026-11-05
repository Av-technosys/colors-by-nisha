import "server-only";

import { and, asc, desc, eq, gte, isNotNull, lte, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs, contactUs, orders, products, productVariants, users } from "@/lib/db/schema";
import { requireAdmin } from "@/helpers/auth/access";

export type RevenuePoint = { date: string; value: number };

export function revenueDays(rows: { date: string; value: string }[], today: string): RevenuePoint[] {
  const values = new Map(rows.map(row => [row.date, Number(row.value)]));
  const end = Date.parse(`${today}T00:00:00Z`);
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(end - (29 - index) * 86_400_000).toISOString().slice(0, 10);
    return { date, value: values.get(date) ?? 0 };
  });
}

export async function getAdminDashboard() {
  await requireAdmin();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const since = new Date(Date.parse(`${today}T00:00:00+05:30`) - 29 * 86_400_000);
  const revenueDate = sql<string>`to_char(${orders.paidAt} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`;
  const results = await Promise.allSettled([
    db.select({
      collected: sql<string>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.paidAt} is not null), 0)::text`,
      paid: sql<number>`count(*) filter (where ${orders.paidAt} is not null)::int`,
      totalOrders: sql<number>`count(*)::int`,
      activeOrders: sql<number>`count(*) filter (where ${orders.paidAt} is not null and ${orders.status} not in ('delivered', 'cancelled'))::int`,
      totalProducts: sql<number>`(select count(*)::int from ${products})`,
      activeProducts: sql<number>`(select count(*)::int from ${products} where ${products.status} = 'active')`,
      customers: sql<number>`(select count(*)::int from ${users} where ${users.deletedAt} is null)`,
      lowStock: sql<number>`(select count(*)::int from ${productVariants} as inventory join ${products} as catalog on catalog.id = inventory.product_id where inventory.stock <= 5 and catalog.status not in ('draft', 'archived'))`,
      drafts: sql<number>`(select count(*)::int from ${blogs} where ${blogs.isDraft} = true)`,
      enquiries: sql<number>`(select count(*)::int from ${contactUs})`,
    }).from(orders),
    db.select({ date: revenueDate, value: sql<string>`sum(${orders.totalAmount})::text` }).from(orders).where(and(isNotNull(orders.paidAt), gte(orders.paidAt, since))).groupBy(revenueDate).orderBy(revenueDate),
    db.select({ id: productVariants.id, productId: products.id, name: products.name, option: productVariants.name, stock: productVariants.stock })
      .from(productVariants).innerJoin(products, eq(products.id, productVariants.productId))
      .where(and(isNotNull(productVariants.stock), lte(productVariants.stock, 5), notInArray(products.status, ["draft", "archived"])))
      .orderBy(asc(productVariants.stock), asc(products.name)).limit(3),
    db.select({ id: orders.id, status: orders.status, totalAmount: orders.totalAmount, createdAt: orders.createdAt, customerName: users.fullName, shippingName: orders.shippingName })
      .from(orders).leftJoin(users, eq(users.id, orders.userId)).orderBy(desc(orders.createdAt), desc(orders.id)).limit(5),
  ] as const);
  for (const result of results) if (result.status === "rejected") console.error("Admin overview section unavailable", result.reason);
  return {
    metrics: results[0].status === "fulfilled" ? results[0].value[0] : null,
    revenue: results[1].status === "fulfilled" ? revenueDays(results[1].value, today) : null,
    lowStock: results[2].status === "fulfilled" ? results[2].value : null,
    recentOrders: results[3].status === "fulfilled" ? results[3].value : null,
    unavailable: results.some(result => result.status === "rejected"),
  };
}

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboard>>;
