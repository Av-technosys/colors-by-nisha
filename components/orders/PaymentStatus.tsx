"use client";

import { UserFacingError, friendlyError } from "@/helpers/errors";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payForOrder } from "@/helpers/payments/browser";
import { useStore } from "@/components/store/StoreContext";

export function PaymentStatus({ orderId, paid, cancelled, awaitingConfirmation = false }: { orderId: string; paid: boolean; cancelled: boolean; awaitingConfirmation?: boolean }) {
  const router = useRouter();
  const { completeOrder } = useStore();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [checking, setChecking] = useState(awaitingConfirmation);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!paid) return;
    try {
      const stored = sessionStorage.getItem(`cbn_pending_cart:${orderId}`);
      if (stored) { sessionStorage.removeItem(`cbn_pending_cart:${orderId}`); completeOrder(JSON.parse(stored)); sessionStorage.removeItem("cbn_checkout"); }
    } catch { /* Storage unavailable */ }
  }, [paid, orderId, completeOrder]);
  useEffect(() => {
    if (paid || cancelled) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    async function check() {
      try {
        const response = await fetch(`/api/orders/${orderId}/payment`, { signal: controller.signal, cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new UserFacingError(result.error || "Payment status could not be checked.");
        if (result.paid) { router.refresh(); return; }
        if (!controller.signal.aborted && awaitingConfirmation && ++tries < 6) timer = setTimeout(check, 4000);
        else if (!controller.signal.aborted) setChecking(false);
      } catch (reason) { if (!controller.signal.aborted) { setChecking(false); setError(friendlyError(reason, "Please check your payment again shortly.")); } }
    }
    check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [paid, cancelled, orderId, router, awaitingConfirmation, refresh]);
  if (paid || cancelled) return null;
  function pay() {
    setError("");
    startTransition(async () => {
      try {
        const result = await payForOrder(orderId);
        if (result.paid) router.refresh();
        else { setChecking(true); setRefresh(value => value + 1); }
      } catch (reason) { setError(friendlyError(reason, "Payment could not be started.")); }
    });
  }
  return <section className="mb-7 rounded-md border border-[#e8e3da] bg-[#faf9f6] p-5">
    <h2 className="font-display text-xl">{checking ? "Confirming your payment" : "Payment pending"}</h2>
    <p className="mt-2 text-sm leading-relaxed text-neutral-500">{checking ? "Your order is saved. You can stay here while we check the payment status." : "Complete payment to confirm your order. If you have already paid, check the status before trying again."}</p>
    {error && <p role="alert" className="mt-3 text-sm text-[#9e5144]">{error}</p>}
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={pending || checking} onClick={pay} className="min-h-11 rounded-md bg-purple px-5 text-sm text-white disabled:opacity-50">{pending ? "Opening payment…" : "Complete payment"}</button><button type="button" disabled={checking} onClick={() => { setChecking(true); setError(""); setRefresh(value => value + 1); }} className="min-h-11 rounded-md border border-[#ddd5c8] px-5 text-sm text-purple disabled:opacity-50">{checking ? "Checking…" : "Check payment status"}</button></div>
  </section>;
}
