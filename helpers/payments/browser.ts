"use client";

import { UserFacingError } from "@/helpers/errors";


type PaymentResult = { paid: boolean; pending?: boolean; requiresAttention?: boolean };
type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type GatewayOptions = {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string;
  prefill: { name: string; email: string; contact: string }; theme: { color: string };
  handler: (response: PaymentResponse) => void; modal: { ondismiss: () => void };
};
type GatewayWindow = Window & { Razorpay?: new (options: GatewayOptions) => { open: () => void } };
let scriptPromise: Promise<void> | undefined;

export function loadPaymentScript() {
  if ((window as GatewayWindow).Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(failed, 15000);
    function failed() { window.clearTimeout(timeout); script.remove(); scriptPromise = undefined; reject(new Error("Payment could not load. Please check your connection and try again.")); }
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { if (!(window as GatewayWindow).Razorpay) { failed(); return; } window.clearTimeout(timeout); resolve(); };
    script.onerror = failed;
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function payForOrder(orderId: string, email = ""): Promise<PaymentResult> {
  await loadPaymentScript();
  const response = await fetch("/api/payment/razorpay/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, signal: typeof AbortSignal !== "undefined" ? AbortSignal.timeout(20_000) : undefined, body: JSON.stringify({ orderId }) });
  const data = await response.json();
  if (!response.ok) throw new UserFacingError(data.error || "Payment could not be started.");
  if (data.paid || response.status === 202) return { paid: Boolean(data.paid), pending: !data.paid };
  const Gateway = (window as GatewayWindow).Razorpay;
  if (!Gateway || !data.keyId || !data.razorpayOrderId) throw new UserFacingError("Payment is temporarily unavailable. Please try again.");
  return new Promise((resolve, reject) => {
    let confirming = false;
    const gateway = new Gateway({
      key: data.keyId, amount: data.amount, currency: data.currency, name: "Colors by Nisha",
      description: `Order ${data.orderReference}`, order_id: data.razorpayOrderId,
      prefill: { name: data.customer.name, email, contact: data.customer.phone }, theme: { color: "#2d254d" },
      handler: async confirmation => {
        confirming = true;
        try {
          const verified = await fetch("/api/payment/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, signal: typeof AbortSignal !== "undefined" ? AbortSignal.timeout(20_000) : undefined, body: JSON.stringify({ orderId, ...confirmation }) });
          const result = await verified.json();
          if (!verified.ok) throw new UserFacingError(result.error || "We are checking your payment.");
          resolve(result);
        } catch { resolve({ paid: false, pending: true }); }
      },
      modal: { ondismiss: () => { if (!confirming) reject(new Error("Payment was cancelled. Your items are still in your cart.")); } },
    });
    gateway.open();
  });
}
