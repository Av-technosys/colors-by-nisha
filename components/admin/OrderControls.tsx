"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nextStatuses, statusLabels, type OrderStatus } from "@/helpers/orders/input";

export function OrderControls({ order }: { order: {
  id: string; paidAt: string | null; stockDeductedAt: string | null; status: string; updatedAt: string; courierName: string | null; trackingNumber: string | null;
  trackingUrl: string | null; estimatedDeliveryDate: string;
} }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ error?: boolean; text: string } | null>(null);
  const [status, setStatus] = useState(order.status);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setNotice(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, updatedAt: order.updatedAt }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Order could not be updated.");
      setNotice({ text: "Order updated." }); router.refresh();
    } catch (reason) { setNotice({ error: true, text: reason instanceof Error ? reason.message : "Unable to connect. Please try again." }); }
    finally { setBusy(false); }
  }
  const terminal = ["delivered", "cancelled"].includes(order.status);
  return <form onSubmit={save} className="rounded-md border border-[#e8e3da] bg-white p-5 md:p-7">
    <h2 className="font-display text-xl">Manage order</h2><p className="mb-5 mt-2 text-xs leading-relaxed text-neutral-500">Successful payment automatically updates stock and moves the order to Processing.</p>
    {order.paidAt && !order.stockDeductedAt && order.status !== "cancelled" && <p role="alert" className="mb-4 text-sm text-[#9e5144]">Payment received. Stock needs attention before this order can be processed.</p>}
    <fieldset disabled={busy || terminal} className="space-y-4 disabled:opacity-60">
      <label className="block text-xs text-neutral-500">Order status<select name="status" value={status} onChange={event => setStatus(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-purple">{[order.status, ...nextStatuses(order.status).filter(value => value !== "processing" || Boolean(order.paidAt))].map(value => <option key={value} value={value}>{statusLabels[value as OrderStatus] || value}</option>)}</select></label>
      {([ ["courierName", "Courier", order.courierName, "text", 100], ["trackingNumber", "Tracking number", order.trackingNumber, "text", 100], ["trackingUrl", "Tracking URL", order.trackingUrl, "url", 2000], ["estimatedDeliveryDate", "Estimated delivery", order.estimatedDeliveryDate, "date", 10] ] as const).map(([name, label, value, type, maxLength]) => <label key={name} className="block text-xs text-neutral-500">{label}<input name={name} type={type} defaultValue={value || ""} maxLength={maxLength} required={["shipped", "out_for_delivery"].includes(status) && ["courierName", "trackingNumber"].includes(name)} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm outline-none focus:border-purple" /></label>)}
      {status === "cancelled" && order.status !== "cancelled" && <p className="text-xs leading-relaxed text-[#9e5144]">Cancelling restores allocated stock. Any payment refund must be handled separately.</p>}
      <button className="min-h-11 w-full rounded-md bg-purple px-5 text-sm text-white">{busy ? "Saving…" : "Save changes"}</button>
    </fieldset>
    {terminal && <p className="mt-4 text-xs text-neutral-500">This order is {order.status}.</p>}
    {notice && <p role={notice.error ? "alert" : "status"} className={`mt-4 text-sm ${notice.error ? "text-[#9e5144]" : "text-[#517254]"}`}>{notice.text}</p>}
  </form>;
}
