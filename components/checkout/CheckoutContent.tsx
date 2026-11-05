"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useStore } from "@/components/store/StoreContext";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/data/products";
import type { CustomerAccount } from "@/helpers/auth/account";
import type { CartQuote } from "@/helpers/orders/input";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const subscribe = () => () => {};
const inputClass = "mt-2 min-h-12 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-sm outline-none focus:border-purple focus:ring-2 focus:ring-purple/10";

export function CheckoutContent({ account }: { account: CustomerAccount }) {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { cart, completeOrder } = useStore();
  const indianAddresses = account.addresses.filter(item => item.country === "India");
  const defaultAddress = indianAddresses.find(item => item.isDefault) ?? indianAddresses[0];
  const [address, setAddress] = useState({ fullName: defaultAddress?.fullName ?? account.fullName, phone: defaultAddress?.phone ?? account.mobile, address: defaultAddress?.address ?? "", apartment: defaultAddress?.apartment ?? "", city: defaultAddress?.city ?? "", state: defaultAddress?.state ?? "", pinCode: defaultAddress?.pinCode ?? "" });
  const [quote, setQuote] = useState<{ key: string; data: CartQuote } | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const submitting = useRef(false);
  const attempt = useRef<{ fingerprint: string; id: string } | null>(null);
  const linesKey = JSON.stringify(cart.map(({ slug, variantId, size, quantity }) => ({ slug, variantId, size, quantity })));
  const currentQuote = quote?.key === linesKey ? quote.data : null;

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (!mounted || linesKey === "[]") return;
    const controller = new AbortController();
    fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: JSON.parse(linesKey) }), signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to refresh your order summary.");
        if (!controller.signal.aborted) { setQuote({ key: linesKey, data: result }); setQuoteError(""); }
      }).catch(reason => { if (!controller.signal.aborted) { setQuote(null); setQuoteError(reason instanceof Error ? reason.message : "Unable to refresh your order summary."); } });
    return () => controller.abort();
  }, [linesKey, mounted, refresh]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    if (!acceptedTerms) {
      setError("Please agree to the terms and conditions and return policy to proceed.");
      return;
    }

    if (!currentQuote) {
      setError(quoteError || "Checking item prices and stock. Please click Refresh prices above or try again in a moment.");
      return;
    }

    if (!address.fullName.trim() || !address.phone.trim() || !address.address.trim() || !address.city.trim() || !address.state.trim() || !address.pinCode.trim()) {
      setError("Please fill in all required shipping address fields.");
      return;
    }

    submitting.current = true;
    setBusy(true);
    setError("");
    const purchased = cart.map(item => ({ ...item }));

    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error("Unable to initialize Razorpay checkout. Please check your network connection.");
      }

      const payload = { items: JSON.parse(linesKey), address, acceptedTerms, expectedSubtotal: currentQuote.subtotal };
      const fingerprint = JSON.stringify(payload);
      let id = attempt.current?.fingerprint === fingerprint ? attempt.current.id : crypto.randomUUID();
      try {
        const saved = JSON.parse(sessionStorage.getItem("cbn_checkout") || "null");
        if (saved?.fingerprint === fingerprint && typeof saved.id === "string") id = saved.id;
        sessionStorage.setItem("cbn_checkout", JSON.stringify({ id, fingerprint }));
      } catch { /* Storage unavailable */ }
      attempt.current = { id, fingerprint };

      // Step 1: Save/get the order in CBN database
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id }),
      });
      const orderResult = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderResult.error || "Your order could not be saved.");

      // Step 2: Create a Razorpay order from backend
      const rzpResponse = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderResult.id }),
      });
      const rzpData = await rzpResponse.json();
      if (!rzpResponse.ok) throw new Error(rzpData.error || "Unable to initiate payment with Razorpay.");

      // Step 3: Open Razorpay checkout modal
      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Colors by Nisha",
        description: `Order ${rzpData.orderReference}`,
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: rzpData.customer.name,
          email: rzpData.customer.email,
          contact: rzpData.customer.phone,
        },
        notes: {
          orderId: rzpData.orderId,
          orderReference: rzpData.orderReference,
        },
        theme: {
          color: "#2d254d",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setBusy(true);
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: rzpData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyResult = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyResult.error || "Payment verification failed.");
            }
            completeOrder(purchased);
            try { sessionStorage.removeItem("cbn_checkout"); } catch { /* Storage unavailable */ }
            router.push(`/orders/${orderResult.id}?received=1&payment=success`);
          } catch (verifyErr) {
            setError(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed. If your money was deducted, our team will confirm your order shortly.");
            submitting.current = false;
            setBusy(false);
          }
        },
        modal: {
          ondismiss: function () {
            submitting.current = false;
            setBusy(false);
          },
        },
      };

      type RazorpayInstance = {
        open: () => void;
        on: (event: string, callback: (resp: { error?: { description?: string } }) => void) => void;
      };
      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: typeof options) => RazorpayInstance }).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
        setError(resp.error?.description || "Payment was unsuccessful or cancelled. Please try again.");
        submitting.current = false;
        setBusy(false);
      });
      rzp.open();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to connect. Please try again.");
      submitting.current = false;
      setBusy(false);
    }
  }

  if (!mounted) return <p className="py-24 text-center text-sm text-neutral-500">Loading checkout…</p>;
  if (!cart.length) return <div className="py-24 text-center"><h1 className="font-display text-3xl">Your cart is empty</h1><Link href="/shop" className="mt-5 inline-block text-sm text-purple underline underline-offset-4">Explore the collection</Link></div>;

  return <div className="mx-auto max-w-[1200px] px-5 py-10 md:py-14">
    <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-xs text-neutral-500"><ArrowLeft size={14} />Back to cart</Link>
    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#94764d]">Colors by Nisha</p>
    <h1 className="font-display text-3xl md:text-4xl">A few details, then it’s yours.</h1>
    <p className="mb-9 mt-3 text-sm text-neutral-500">Complete your delivery address and pay securely using UPI, Cards, or NetBanking via Razorpay.</p>
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
      <div className="space-y-7">
        <section className="rounded-md border border-[#e8e3da] p-5 md:p-7">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl">Contact details</h2><Link href="/dashboard" className="text-xs text-purple underline underline-offset-4">Edit account</Link></div>
          <p className="break-words text-sm font-medium">{account.fullName || address.fullName || "Name will be taken from delivery address"}</p>
          <p className="mt-2 break-all text-sm text-neutral-500">{account.email || "Email not found"}</p>
          <p className="mt-2 text-sm text-neutral-500">{account.mobile || (address.phone ? `${address.phone} (from shipping address)` : "Phone number will be taken from delivery address")}</p>
          <p className="mt-4 text-xs leading-relaxed text-neutral-400">Enter the recipient’s name and contact number in the delivery address below.</p>
        </section>
        <section className="rounded-md border border-[#e8e3da] p-5 md:p-7">
          <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-display text-xl">Delivery address</h2><Link href="/dashboard" className="text-xs text-purple underline underline-offset-4">Manage addresses</Link></div>
          {indianAddresses.length > 0 && <label className="mb-5 block text-xs text-neutral-500">Use a saved address<select className={inputClass} defaultValue={defaultAddress?.id ?? ""} onChange={event => {
            const selected = account.addresses.find(item => item.id === event.target.value);
            setAddress(selected ? { fullName: selected.fullName, phone: selected.phone, address: selected.address, apartment: selected.apartment, city: selected.city, state: selected.state, pinCode: selected.pinCode } : { fullName: account.fullName, phone: account.mobile, address: "", apartment: "", city: "", state: "", pinCode: "" });
          }}><option value="">Enter an address</option>{indianAddresses.map(item => <option key={item.id} value={item.id}>{item.address}, {item.city}</option>)}</select></label>}
          <div className="grid gap-5 sm:grid-cols-2">
            {([
              ["fullName", "Recipient name", "shipping name", 120], ["phone", "Contact number", "shipping tel", 30],
              ["address", "Street address", "street-address", 180], ["apartment", "Apartment / landmark (optional)", "address-line2", 80],
              ["city", "City", "address-level2", 80], ["state", "State", "address-level1", 80], ["pinCode", "PIN code", "postal-code", 6],
            ] as const).map(([key, label, autoComplete, maxLength]) => <label key={key} className={`block text-xs text-neutral-500 ${key === "address" || key === "apartment" ? "sm:col-span-2" : ""}`}>{label}<input className={inputClass} value={address[key]} onChange={event => setAddress(current => ({ ...current, [key]: event.target.value }))} name={key} autoComplete={autoComplete} maxLength={maxLength} required={key !== "apartment"} inputMode={key === "pinCode" ? "numeric" : undefined} pattern={key === "pinCode" ? "[0-9]{6}" : undefined} /></label>)}
            <div className="text-xs text-neutral-500">Country<p className="mt-3 text-sm text-ink">India</p></div>
          </div>
        </section>
      </div>
      <section className="rounded-md border border-[#e8e3da] bg-[#faf9f6] p-5 md:p-7 lg:sticky lg:top-24">
        <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-display text-xl">Your order</h2><button type="button" disabled={busy} onClick={() => { setQuote(null); setQuoteError(""); setRefresh(value => value + 1); }} className="min-h-10 text-xs text-purple underline underline-offset-4">Refresh prices</button></div>
        {quoteError && <div role="alert" className="mb-5 text-sm text-[#9e5144]">{quoteError}<button type="button" onClick={() => setRefresh(value => value + 1)} className="ml-2 underline underline-offset-4">Refresh summary</button></div>}
        {!currentQuote && !quoteError && <p role="status" className="py-5 text-sm text-neutral-500">Checking current prices and availability…</p>}
        <div className="divide-y divide-[#e8e3da]">{currentQuote?.items.map((item, index) => <div key={index} className="flex gap-4 py-4"><div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100"><Image src={item.image} alt={item.name} fill unoptimized sizes="64px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="font-display text-sm">{item.name}</p><p className="mt-1 text-xs text-neutral-500">{item.size || "Standard"} · Qty {item.quantity}</p><p className="mt-3 text-sm">{formatINR(Number(item.price) * item.quantity)}</p></div></div>)}</div>
        <dl className="mt-5 space-y-3 border-t border-[#e8e3da] pt-5 text-sm"><div className="flex justify-between gap-3"><dt>Items total</dt><dd>{currentQuote ? formatINR(Number(currentQuote.subtotal)) : "—"}</dd></div><div className="flex justify-between gap-3 text-xs text-neutral-500"><dt>Shipping</dt><dd>Complimentary</dd></div><div className="flex justify-between gap-3 text-xs text-neutral-500"><dt>Payment method</dt><dd>Razorpay (UPI / Cards / NetBanking)</dd></div></dl>
        <label className="mt-6 flex items-start gap-3 text-xs leading-relaxed text-neutral-500"><input type="checkbox" required checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-purple" /><span>I agree to the <Link href="/terms-and-conditions" target="_blank" className="text-purple underline underline-offset-2">terms and conditions</Link> and <Link href="/return-and-refund" target="_blank" className="text-purple underline underline-offset-2">return policy</Link>.</span></label>
        {error && <p role="alert" className="mt-4 text-sm text-[#9e5144]">{error}</p>}
        <Button variant="hero" type="submit" disabled={busy} className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none">
          {busy ? "Opening Razorpay…" : currentQuote ? `Pay ${formatINR(Number(currentQuote.subtotal))} with Razorpay` : "Proceed to Payment"}
        </Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-400"><LockKeyhole size={13} />100% Secure Payment powered by Razorpay</p>
      </section>
    </form>
  </div>;
}
