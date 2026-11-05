import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payment, orders, users } from "@/lib/db/schema";
import { requireAdmin } from "@/helpers/auth/access";
import { orderReference } from "@/helpers/orders/service";
import { formatINR } from "@/data/products";
import { RecordsPage } from "@/components/admin/RecordsPage";
import { paymentPage } from "@/data/admin";
import type { AdminRecord } from "@/data/admin";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  await requireAdmin();

  let liveRecords: AdminRecord[] = [];

  try {
    const dbPayments = await db
      .select({
        id: payment.id,
        paymentId: payment.paymentId,
        paymentOrderId: payment.paymentOrderId,
        paymentStatus: payment.paymentStatus,
        paymentMethod: payment.paymentMethod,
        paymentAmount: payment.paymentAmount,
        createdAt: payment.createdAt,
        orderId: payment.orderId,
        shippingName: orders.shippingName,
        customerEmail: users.email,
        customerName: users.fullName,
      })
      .from(payment)
      .leftJoin(orders, eq(payment.orderId, orders.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(payment.createdAt));

    liveRecords = dbPayments.map(item => {
      const isPaid = item.paymentStatus === "captured";
      const dateStr = item.createdAt
        ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(item.createdAt)
        : "";
      const id = item.paymentId || `PAY-${item.id.slice(0, 8).toUpperCase()}`;
      return {
        id,
        title: item.paymentId || item.paymentOrderId || "Pending payment",
        subtitle: item.orderId ? `Order #${orderReference(item.orderId)}` : "Order reference pending",
        status: isPaid ? "Paid" : item.paymentStatus === "refunded" ? "Refunded" : item.paymentStatus === "failed" ? "Failed" : "Pending",
        detail: isPaid
          ? `Payment received on ${dateStr}. Razorpay ID: ${item.paymentId}`
          : "Payment pending or in progress.",
        fields: {
          Customer: item.shippingName || item.customerName || item.customerEmail || "Customer",
          Amount: formatINR(Number(item.paymentAmount) / 100),
          Method: item.paymentMethod ? item.paymentMethod.toUpperCase() : "Razorpay",
        },
      };
    });
  } catch {
    // In case table is created but empty or during push
    liveRecords = [];
  }

  const mergedData = {
    ...paymentPage,
    records: liveRecords,
  };

  return <RecordsPage data={mergedData} />;
}
