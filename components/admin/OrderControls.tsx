"use client";

import { UserFacingError, friendlyError } from "@/helpers/errors";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, CreditCard, Truck } from "lucide-react";
import { nextStatuses, statusLabels, type OrderStatus } from "@/helpers/orders/input";
import { StatusBadge } from "./AdminUI";

export function OrderControls({ order }: { order: {
  id: string; paidAt: string | null; stockDeductedAt: string | null; status: string; updatedAt: string; courierName: string | null; trackingNumber: string | null;
  trackingUrl: string | null; estimatedDeliveryDate: string;
} }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const submitting = useRef(false);
  const [notice, setNotice] = useState<{ error?: boolean; text: string } | null>(null);
  const [status, setStatus] = useState(order.status);
  const terminal = ["delivered", "cancelled"].includes(order.status);
  const ready = Boolean(order.paidAt && order.stockDeductedAt);
  const allowed = nextStatuses(order.status).filter(value => value === "cancelled" || ready || (value === "processing" && order.paidAt));
  const canDeliver = ready && allowed.includes("delivered");
  const disabled = busy || refreshing;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || disabled || terminal) return;
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const nextStatus = submitter?.dataset.status || status;
    const fields = Object.fromEntries(new FormData(form));
    setNotice(null);
    setStatus(nextStatus);
    if (["shipped", "out_for_delivery", "delivered"].includes(nextStatus)) {
      const missing = ["courierName", "trackingNumber"].find(name => !String(fields[name] ?? "").trim());
      if (missing) {
        setNotice({ error: true, text: "Add the courier and tracking number before confirming delivery or dispatch." });
        (form.elements.namedItem(missing) as HTMLInputElement | null)?.focus();
        return;
      }
    }
    submitting.current = true; setBusy(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, status: nextStatus, updatedAt: order.updatedAt }) });
      const result = await response.json();
      if (!response.ok) throw new UserFacingError(result.error || "Order could not be updated.");
      setNotice({ text: nextStatus === "delivered" ? "Order marked as delivered." : "Order updated." });
      startRefresh(() => router.refresh());
    } catch (reason) { setNotice({ error: true, text: friendlyError(reason, "Unable to connect. Please try again.") }); }
    finally { setBusy(false); submitting.current = false; }
  }

  return <form onSubmit={save} className="min-w-0 rounded-md border border-[#e8e3da] bg-white p-5 md:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl">Manage order</h2><StatusBadge status={order.status} /></div>
    <p className="mt-2 text-xs leading-relaxed text-neutral-500">Updates appear in the customer’s order details.</p>
    <div className="my-5 flex items-center gap-2 rounded-md bg-[#faf9f6] px-3 py-3 text-xs"><CreditCard size={15} className="shrink-0 text-neutral-400" /><span className={order.paidAt ? "text-[#517254]" : "text-[#94764d]"}>{order.paidAt ? "Payment confirmed" : "Awaiting payment"}</span></div>
    {order.paidAt && !order.stockDeductedAt && order.status !== "cancelled" && <p role="alert" className="mb-4 text-xs leading-relaxed text-[#9e5144]">Payment received. Resolve the stock issue before dispatching this order.</p>}
    {terminal ? <p className="flex items-start gap-2 border-t border-[#e8e3da] pt-4 text-sm text-neutral-500"><CheckCheck size={18} className="shrink-0" />{order.status === "delivered" ? "Delivery completed. This order is closed." : "This order has been cancelled."}</p> : <fieldset disabled={disabled} className="min-w-0 space-y-4 disabled:opacity-60">
      <label className="block text-xs text-neutral-500">Order status<select name="status" value={status} onChange={event => { setStatus(event.target.value); setNotice(null); }} className="mt-2 min-h-11 w-full min-w-0 rounded-md border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-purple">{[order.status, ...allowed].map(value => <option key={value} value={value}>{statusLabels[value as OrderStatus] || value}</option>)}</select></label>
      <div className="border-t border-[#eeeae4] pt-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-medium"><Truck size={15} className="text-[#94764d]" />Delivery details</h3><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {([ ["courierName", "Courier name", order.courierName, "text", 100], ["trackingNumber", "Tracking number", order.trackingNumber, "text", 100], ["trackingUrl", "Tracking link (optional)", order.trackingUrl, "url", 2000], ["estimatedDeliveryDate", "Estimated delivery (optional)", order.estimatedDeliveryDate, "date", 10] ] as const).map(([name, label, value, type, maxLength]) => <label key={name} className="block min-w-0 text-xs text-neutral-500">{label}<input name={name} type={type} defaultValue={value || ""} maxLength={maxLength} placeholder={name === "trackingUrl" ? "https://" : undefined} required={["shipped", "out_for_delivery", "delivered"].includes(status) && ["courierName", "trackingNumber"].includes(name)} className="mt-2 min-h-11 w-full min-w-0 rounded-md border border-[#e5e1da] px-3 text-sm outline-none focus:border-purple" /></label>)}
      </div></div>
      {status === "cancelled" && order.status !== "cancelled" && <p className="rounded-md bg-[#faf3e6] p-3 text-xs leading-relaxed text-[#9e5144]">Cancelling restores allocated stock. Refunds must be handled separately through the payment provider.</p>}
      <button type="submit" className="min-h-11 w-full rounded-md bg-purple px-5 text-sm text-white transition hover:bg-[#40345f]">{disabled ? "Saving…" : status === "delivered" ? "Mark as delivered" : status !== order.status ? `Update to ${statusLabels[status as OrderStatus]}` : "Save delivery details"}</button>
      {canDeliver && status !== "delivered" && status !== "cancelled" && <button type="submit" data-status="delivered" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#c4a36a] bg-[#faf9f6] px-4 text-sm text-purple transition hover:bg-[#f2eff6]"><CheckCheck size={17} />Mark as delivered</button>}
    </fieldset>}
    {notice && <p role={notice.error ? "alert" : "status"} className={`mt-4 text-sm ${notice.error ? "text-[#9e5144]" : "text-[#517254]"}`}>{notice.text}</p>}
  </form>;
}
