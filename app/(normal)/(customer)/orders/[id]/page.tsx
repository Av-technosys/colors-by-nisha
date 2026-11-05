import { OrderSkeleton } from "@/components/ui/PageSkeletons";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getOrder, orderReference } from "@/helpers/orders/service";
import { PaymentStatus } from "@/components/orders/PaymentStatus";
import { OrderSummary } from "@/components/orders/OrderSummary";

export const metadata: Metadata = { title: "Order details | Colors by Nisha", robots: { index: false, follow: false } };
async function Details({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ received?: string; payment?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const order = await getOrder(id, user.id);
  if (!order) notFound();
  const { received, payment } = await searchParams;
  return (
    <div className="min-w-0">
      <Link href="/orders" className="mb-7 inline-block text-xs text-purple">← Your orders</Link>
      {received === "1" && (
        <div role="status" className="mb-7 rounded-md border border-[#dce7db] bg-[#edf4ed] p-5 text-[#517254]">
          <h2 className="font-display text-2xl">
            {order.paidAt ? "Thank you! Your payment has been received." : "Thank you. Your order has been received."}
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            {order.paidAt
              ? "Your payment is confirmed. You can follow delivery updates below."
              : "Your order is saved. Complete payment below to confirm it."}
          </p>
        </div>
      )}
      <h2 className="mb-2 font-display text-3xl">{orderReference(order.id)}</h2>
      <p className="mb-7 break-all text-xs text-neutral-400">Order reference: {order.id}</p>
      <PaymentStatus orderId={order.id} paid={Boolean(order.paidAt)} cancelled={order.status === "cancelled"} awaitingConfirmation={payment === "pending"} />
      {order.paidAt && !order.stockDeductedAt && order.status !== "cancelled" && <p role="status" className="mb-5 rounded-md bg-[#faf3e6] p-4 text-sm text-[#9c7a3f]">Your payment is received. Our team is reviewing item availability before dispatch.</p>}
      <OrderSummary order={order} />
      <Link href="/shop" className="mt-7 inline-block text-sm text-purple underline underline-offset-4">Continue shopping</Link>
    </div>
  );
}
export default function OrderDetailsPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ received?: string; payment?: string }> }) {
  return <Suspense fallback={<OrderSkeleton embedded />}><Details {...props} /></Suspense>;
}
