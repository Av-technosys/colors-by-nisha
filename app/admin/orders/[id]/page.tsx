import { OrderSkeleton } from "@/components/ui/PageSkeletons";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/helpers/auth/access";
import { getOrder, orderReference } from "@/helpers/orders/service";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { OrderControls } from "@/components/admin/OrderControls";
import { PageHeading } from "@/components/admin/AdminUI";

async function Details({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  return <><Link href="/admin/orders" className="mb-6 inline-block text-xs text-purple">← All orders</Link><PageHeading eyebrow="Order management" title={orderReference(order.id)} description={`Full reference: ${order.id}`} /><div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><OrderSummary order={order} /><OrderControls key={order.updatedAt.toISOString()} order={{ id: order.id, paidAt: order.paidAt?.toISOString() ?? null, stockDeductedAt: order.stockDeductedAt?.toISOString() ?? null, status: order.status, updatedAt: order.updatedAt.toISOString(), courierName: order.courierName, trackingNumber: order.trackingNumber, trackingUrl: order.trackingUrl, estimatedDeliveryDate: order.estimatedDeliveryDate ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(order.estimatedDeliveryDate) : "" }} /></div></>;
}
export default function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<OrderSkeleton admin />}><Details {...props} /></Suspense>;
}
