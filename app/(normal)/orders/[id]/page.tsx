import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getOrder, orderReference } from "@/helpers/orders/service";
import { OrderSummary } from "@/components/orders/OrderSummary";

export const metadata: Metadata = { title: "Order details | Colors by Nisha", robots: { index: false, follow: false } };
async function Details({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ received?: string; payment?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const order = await getOrder(id, user.id);
  if (!order) notFound();
  const { received } = await searchParams;
  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10 md:py-14">
      <Link href="/orders" className="mb-7 inline-block text-xs text-purple">← Your orders</Link>
      {received === "1" && (
        <div role="status" className="mb-7 rounded-md border border-[#dce7db] bg-[#edf4ed] p-5 text-[#517254]">
          <h1 className="font-display text-2xl">
            {order.paidAt ? "Thank you! Your payment has been received." : "Thank you. Your order has been received."}
          </h1>
          <p className="mt-2 text-sm leading-relaxed">
            {order.paidAt
              ? `Your payment has been verified via Razorpay${order.paymentId ? ` (ID: ${order.paymentId})` : ""}. Your order is now being processed.`
              : "Payment and shipping charges will be confirmed separately. You can follow delivery updates on this page."}
          </p>
        </div>
      )}
      <h2 className="mb-2 font-display text-3xl">{orderReference(order.id)}</h2>
      <p className="mb-7 break-all text-xs text-neutral-400">Order reference: {order.id}</p>
      <OrderSummary order={order} />
      <Link href="/shop" className="mt-7 inline-block text-sm text-purple underline underline-offset-4">Continue shopping</Link>
    </div>
  );
}
export default function OrderDetailsPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ received?: string; payment?: string }> }) {
  return <Suspense fallback={<p className="py-24 text-center text-sm text-neutral-500">Loading order…</p>}><Details {...props} /></Suspense>;
}
