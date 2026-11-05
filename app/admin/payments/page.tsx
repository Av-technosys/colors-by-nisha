import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { requireAdmin } from "@/helpers/auth/access";
import { orderReference } from "@/helpers/orders/service";
import { formatINR } from "@/data/products";
import { RecordsPage } from "@/components/admin/RecordsPage";
import { paymentPage } from "@/data/admin";
import type { AdminRecord } from "@/data/admin";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  await requireAdmin();

  const dbOrders = await db
    .select({
      id: orders.id,
      paymentId: orders.paymentId,
      paidAt: orders.paidAt,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
      shippingName: orders.shippingName,
      userFullName: users.fullName,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  const liveRecords: AdminRecord[] = dbOrders.map(item => {
    const isPaid = Boolean(item.paidAt);
    const dateStr = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(item.createdAt);
    const id = item.paymentId || `ORD-${item.id.slice(0, 8).toUpperCase()}`;
    return {
      id,
      title: item.paymentId || "Pending transaction",
      subtitle: `Order #${orderReference(item.id)}`,
      status: isPaid ? "Paid" : item.status === "cancelled" ? "Refunded" : "Pending",
      detail: isPaid
        ? `Payment verified on ${item.paidAt ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(item.paidAt) : dateStr}. Razorpay Payment ID: ${item.paymentId}`
        : "Awaiting Razorpay confirmation.",
      fields: {
        Customer: item.shippingName || item.userFullName || item.userEmail || "Customer",
        Amount: formatINR(Number(item.totalAmount)),
        Method: item.paymentId ? "Razorpay (Online)" : "Pending",
      },
    };
  });

  const mergedData = {
    ...paymentPage,
    records: liveRecords,
  };

  return <RecordsPage data={mergedData} />;
}
