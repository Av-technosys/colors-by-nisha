"use client";

import { UserFacingError, friendlyError } from "@/helpers/errors";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useStore } from "@/components/store/StoreContext";
import { FormSkeleton, ItemSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { payForOrder } from "@/helpers/payments/browser";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/data/products";
import type { CustomerAccount, SavedAddress } from "@/helpers/auth/account";
import type { CartQuote } from "@/helpers/orders/input";
import { Container } from "@/components/layout/Container";

import { CheckoutAddresses } from "./CheckoutAddresses";

export function CheckoutContent() {
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [accountError, setAccountError] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [accountRefresh, setAccountRefresh] = useState(0);
  const router = useRouter();
  const { cart, cartReady } = useStore();
  const [error, setError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [address, setAddress] = useState({ fullName: "", phone: "", address: "", apartment: "", city: "", state: "", pinCode: "" });

  const selectAddress = useCallback((selected: SavedAddress | null) => {
    setSelectedAddressId(selected?.id ?? "");
    setAddress({ fullName: selected?.fullName ?? "", phone: selected?.phone ?? "", address: selected?.address ?? "", apartment: selected?.apartment ?? "", city: selected?.city ?? "", state: selected?.state ?? "", pinCode: selected?.pinCode ?? "" });
    setError("");
  }, []);
  const [quote, setQuote] = useState<{ key: string; data: CartQuote } | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [busy, setBusy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const submitting = useRef(false);
  const attempt = useRef<{ fingerprint: string; id: string } | null>(null);
  const linesKey = JSON.stringify(cart.map(({ slug, variantId, size, quantity }) => ({ slug, variantId, size, quantity })));
  const currentQuote = quote?.key === linesKey ? quote.data : null;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/account", { signal: controller.signal, cache: "no-store" }).then(async response => {
      const data = await response.json();
      if (response.status === 401) { setSignedOut(true); return; }
      if (!response.ok) throw new UserFacingError(data.error);
      if (controller.signal.aborted) return;
      setAccount(data); setAccountError("");
      const selected = data.addresses.find((item: { country: string; isDefault: boolean }) => item.country === "India" && item.isDefault) ?? data.addresses.find((item: { country: string }) => item.country === "India");
      selectAddress(selected ?? null);
    }).catch(reason => { if (!controller.signal.aborted) setAccountError(friendlyError(reason, "Your account could not be loaded.")); });
    return () => controller.abort();
  }, [accountRefresh, selectAddress]);

  useEffect(() => {
    if (!cartReady || linesKey === "[]") return;
    const controller = new AbortController();
    fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: JSON.parse(linesKey) }), signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new UserFacingError(result.error || "Unable to refresh your order summary.");
        if (!controller.signal.aborted) { setQuote({ key: linesKey, data: result }); setQuoteError(""); }
      }).catch(reason => { if (!controller.signal.aborted) { setQuote(null); setQuoteError(friendlyError(reason, "Unable to refresh your order summary.")); } });
    return () => controller.abort();
  }, [linesKey, cartReady, refresh]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !cartReady) return;
    if (!account) {
      setError(signedOut ? "Please sign in before continuing to payment." : "Your account details are still loading. Please try again shortly.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please agree to the terms and conditions and return policy to proceed.");
      document.getElementById("checkout-terms")?.focus();
      return;
    }

    if (!currentQuote) {
      setError(quoteError || "Checking item prices and stock. Please try again in a moment.");
      return;
    }

    if (!address.fullName.trim() || !address.phone.trim() || !address.address.trim() || !address.city.trim() || !address.state.trim() || !address.pinCode.trim()) {
      setError("Please select or add a delivery address to continue.");
      return;
    }

    submitting.current = true;
    setBusy(true);
    setError("");
    const purchased = cart.map(item => ({ ...item }));

    try {
      const payload = { items: JSON.parse(linesKey), address, acceptedTerms, expectedSubtotal: currentQuote.subtotal };
      const fingerprint = JSON.stringify([account?.email, payload]);
      let id = attempt.current?.fingerprint === fingerprint ? attempt.current.id : crypto.randomUUID();
      try {
        const saved = JSON.parse(sessionStorage.getItem("cbn_checkout") || "null");
        if (saved?.fingerprint === fingerprint && typeof saved.id === "string") id = saved.id;
        sessionStorage.setItem("cbn_checkout", JSON.stringify({ id, fingerprint }));
      } catch { /* Storage unavailable */ }
      attempt.current = { id, fingerprint };

      const orderResponse = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, id }),
      });
      const orderResult = await orderResponse.json();
      if (!orderResponse.ok) {
        if (orderResult.code === "price_changed") { setQuote(null); setQuoteError(""); setRefresh(value => value + 1); }
        throw new UserFacingError(orderResult.error || "Your order could not be saved.");
      }
      try { sessionStorage.setItem(`cbn_pending_cart:${orderResult.id}`, JSON.stringify(purchased)); } catch { /* Storage unavailable */ }
      const paid = await payForOrder(orderResult.id, account?.email);
      if (paid.paid) {
        try { sessionStorage.removeItem("cbn_checkout"); } catch { /* Storage unavailable */ }
      }
      router.push(`/orders/${orderResult.id}?received=1${paid.paid ? "" : "&payment=pending"}`);
    } catch (reason) {
      setError(friendlyError(reason, "Unable to connect. Please try again."));
      submitting.current = false;
      setBusy(false);
    }
  }

  if (cartReady && !cart.length) return <Container className="py-24 text-center"><h1 className="font-display text-3xl">Your cart is empty</h1><Link href="/shop" className="mt-5 inline-block text-sm text-purple underline underline-offset-4">Explore the collection</Link></Container>;

  return <Container className="py-10 md:py-14">
    <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-xs text-neutral-500"><ArrowLeft size={14} />Back to cart</Link>
    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#94764d]">Colors by Nisha</p>
    <h1 className="font-display text-3xl md:text-4xl">A few details, then it’s yours.</h1>
    <p className="mb-9 mt-3 text-sm text-neutral-500">Choose your delivery address and complete your order.</p>
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
      <fieldset disabled={busy} className="min-w-0 space-y-7 disabled:opacity-70">
        {signedOut ? <section className="rounded-md border border-[#e8e3da] p-7"><h2 className="font-display text-xl">Sign in to checkout</h2><p className="mt-3 text-sm text-neutral-500">Your cart will be waiting after you sign in.</p><Link href="/login?redirect_url=/checkout" className="mt-5 inline-block rounded-md bg-purple px-5 py-3 text-sm text-white">Sign in</Link></section> : accountError ? <div role="alert" className="rounded-md border border-[#e8e3da] p-7 text-sm">{accountError}<button type="button" onClick={() => setAccountRefresh(value => value + 1)} className="ml-3 text-purple underline">Try again</button></div> : !account ? <><FormSkeleton fields={2} /><FormSkeleton fields={6} /></> : <>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e8e3da] px-5 py-4 text-sm">
          <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">Order updates</p><p className="mt-1 break-all text-neutral-600">{account.email}</p></div>
          <Link href="/dashboard" className="min-h-9 content-center text-xs text-purple underline underline-offset-4">Edit account</Link>
        </div>
        <CheckoutAddresses account={account} selectedId={selectedAddressId} onSelect={selectAddress} onAccountChange={setAccount} />
        </>}
      </fieldset>
      <section className="min-w-0 rounded-md border border-[#e8e3da] bg-[#faf9f6] p-5 md:p-7 lg:sticky lg:top-28">
        <h2 className="mb-5 font-display text-xl">Your order</h2>
        {quoteError && <div role="alert" className="mb-5 text-sm text-[#9e5144]">{quoteError}<Link href="/cart" className="ml-2 underline underline-offset-4">Review cart</Link><button type="button" onClick={() => setRefresh(value => value + 1)} className="ml-2 underline underline-offset-4">Try again</button></div>}
        {!cartReady && <ItemSkeleton />}
        {cartReady && !currentQuote && !quoteError && <p role="status" className="text-xs text-neutral-500">Checking current prices and availability…</p>}
        <div className="divide-y divide-[#e8e3da]">{(currentQuote?.items ?? cart.map(item => ({ ...item, price: String(item.price) }))).map((item, index) => <div key={index} className="flex gap-4 py-4"><div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100"><Image src={item.image} alt={item.name} fill unoptimized sizes="64px" className="object-cover" /></div><div className="min-w-0 flex-1"><Link href={`/products/${item.slug}`} className="font-display text-sm hover:underline">{item.name}</Link><p className="mt-1 text-xs text-neutral-500">{item.size || "Standard"} · Qty {item.quantity}</p><p className="mt-3 text-sm">{currentQuote ? formatINR(Number(item.price) * item.quantity) : quoteError ? formatINR(Number(item.price) * item.quantity) : <Skeleton className="h-4 w-20" />}</p></div></div>)}</div>
        <dl className="mt-5 space-y-3 border-t border-[#e8e3da] pt-5 text-sm"><div className="flex justify-between gap-3"><dt>Items total</dt><dd>{currentQuote ? formatINR(Number(currentQuote.subtotal)) : "—"}</dd></div><div className="flex justify-between gap-3 text-xs text-neutral-500"><dt>Shipping</dt><dd>Confirmed separately</dd></div><div className="flex justify-between gap-3 text-xs text-neutral-500"><dt>Payment method</dt><dd>Razorpay (UPI / Cards / NetBanking)</dd></div></dl>
        <label className="mt-6 flex items-start gap-3 text-xs leading-relaxed text-neutral-500"><input id="checkout-terms" type="checkbox" disabled={busy} checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-purple" /><span>I agree to the <Link href="/terms-and-conditions" target="_blank" className="text-purple underline underline-offset-2">terms and conditions</Link> and <Link href="/return-and-refund" target="_blank" className="text-purple underline underline-offset-2">return policy</Link>.</span></label>
        {error && <p role="alert" className="mt-4 text-sm text-[#9e5144]">{error}</p>}
        <Button variant="hero" type="submit" disabled={busy || !cartReady} className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none">
          {busy ? "Opening Razorpay…" : currentQuote ? `Pay ${formatINR(Number(currentQuote.subtotal))} with Razorpay` : "Proceed to Payment"}
        </Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-400"><LockKeyhole size={13} />100% Secure Payment powered by Razorpay</p>
      </section>
    </form>
  </Container>;
}
