"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatINR, type ProductItem } from "@/data/products";
import { useStore } from "@/components/store/StoreContext";
import { ItemSkeleton, FormSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

interface CartPageContentProps {
  initialCrossSellProducts?: ProductItem[];
}

export function CartPageContent({ initialCrossSellProducts }: CartPageContentProps = {}) {
  const { cart, cartReady, updateQuantity, removeFromCart, syncCart } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (initialCrossSellProducts) syncCart(initialCrossSellProducts);
  }, [initialCrossSellProducts, syncCart]);

  const quantity = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const hasUnavailableItems = cart.some(item => item.available === false || (item.stockCount !== undefined && item.quantity > item.stockCount));

  return <Container className="pb-16 pt-8 text-ink md:pb-24 md:pt-12">
    <Link href="/shop" className="inline-flex min-h-9 items-center gap-2 text-xs text-neutral-500 transition hover:text-purple"><ArrowLeft size={14} />Continue shopping</Link>
    <header className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8e3da] pb-7 md:mb-10 md:mt-8">
      <div><p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#94764d]">Colors by Nisha</p><h1 className="font-display text-3xl md:text-5xl">Your shopping bag</h1></div>
      {cartReady && quantity > 0 && <p className="pb-1 text-sm text-neutral-500">{quantity} {quantity === 1 ? "piece" : "pieces"} selected</p>}
    </header>
    {!cartReady ? <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"><ItemSkeleton count={3} /><FormSkeleton fields={3} /></div> : !cart.length ? <section className="mx-auto max-w-md py-14 text-center md:py-20">
      <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-[#f7f4ee] text-[#94764d]"><ShoppingBag size={25} strokeWidth={1.3} /></span>
      <h2 className="font-display text-2xl">Your bag is waiting</h2><p className="mt-3 text-sm leading-relaxed text-neutral-500">Discover a piece to make your next occasion special.</p>
      <Button variant="hero" onClick={() => router.push("/shop")} className="mt-7">Explore the collection</Button>
    </section> : <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-14">
      <section aria-label="Cart items" className="min-w-0">
        <div className="hidden justify-between border-b border-[#e8e3da] pb-4 text-[10px] uppercase tracking-[0.16em] text-neutral-400 sm:flex"><span>Your selection</span><span>Amount</span></div>
        <div className="divide-y divide-[#e8e3da]">{cart.map((item, index) => {
          const unavailable = item.available === false;
          const overStock = item.stockCount !== undefined && item.quantity > item.stockCount;
          const limit = Math.min(99, item.stockCount ?? 99);
          return <article key={`${item.slug}-${item.variantId}-${item.size}-${index}`} className="flex gap-4 py-6 first:pt-0 sm:gap-6 sm:first:pt-6">
            <Link href={`/products/${item.slug}`} className="relative aspect-2/3 w-24 shrink-0 self-start overflow-hidden rounded-md bg-[#f4f1eb] sm:w-32"><Image src={item.image || "/product-placeholder.svg"} alt={item.name} fill unoptimized sizes="(min-width: 640px) 128px, 96px" className="object-cover transition duration-500 hover:scale-105" /></Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 py-1">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0"><Link href={`/products/${item.slug}`} className="break-words font-display text-base hover:text-purple sm:text-xl">{item.name}</Link><p className="mt-2 text-xs text-neutral-500">{item.size || "Standard"}</p><p className="mt-2 text-xs text-neutral-400">{formatINR(item.price)} each</p></div>
                <p className="text-sm font-medium sm:text-base">{formatINR(item.price * item.quantity)}</p>
              </div>
              {(unavailable || overStock) && <p role="status" className="text-xs leading-relaxed text-[#9e5144]">{unavailable ? "This option is no longer available. Please remove it or choose another option." : `Only ${item.stockCount} available. Please reduce the quantity.`}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-md border border-[#e8e3da] bg-[#faf9f6]" role="group" aria-label={`Quantity for ${item.name}, ${item.size}`}>
                  <button type="button" disabled={item.quantity <= 1} onClick={() => updateQuantity(index, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} className="grid size-9 place-items-center text-purple disabled:opacity-25 sm:size-10"><Minus size={13} /></button>
                  <span aria-live="polite" className="w-7 text-center text-xs tabular-nums">{item.quantity}</span>
                  <button type="button" disabled={unavailable || item.quantity >= limit} onClick={() => updateQuantity(index, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`} className="grid size-9 place-items-center text-purple disabled:opacity-25 sm:size-10"><Plus size={13} /></button>
                </div>
                <button type="button" onClick={() => removeFromCart(index)} aria-label={`Remove ${item.name}`} className="inline-flex min-h-9 items-center gap-1.5 text-xs text-neutral-400 transition hover:text-[#9e5144]"><Trash2 size={13} />Remove</button>
              </div>
            </div>
          </article>;
        })}</div>
      </section>
      <aside className="min-w-0 rounded-md border border-[#e8e3da] bg-[#faf9f6] p-6 md:p-8 lg:sticky lg:top-28" aria-label="Order summary">
        <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#94764d]">Almost yours</p><h2 className="font-display text-2xl">Order summary</h2>
        <dl className="mt-7 space-y-4 text-sm"><div className="flex justify-between gap-4 text-neutral-500"><dt>Items ({quantity})</dt><dd className="text-ink">{formatINR(subtotal)}</dd></div><div className="flex justify-between gap-4 text-xs text-neutral-500"><dt>Shipping</dt><dd>Confirmed separately</dd></div><div className="flex items-center justify-between gap-4 border-t border-[#e8e3da] pt-5"><dt className="font-medium">Items total</dt><dd className="font-display text-xl">{formatINR(subtotal)}</dd></div></dl>
        {hasUnavailableItems && <p role="alert" className="mt-5 text-xs leading-relaxed text-[#9e5144]">Review the marked items before completing your order.</p>}
        <Button variant="hero" onClick={() => router.push("/checkout")} className="mt-7 w-full gap-3">Continue to checkout<ArrowRight size={15} /></Button>
        <p className="mt-4 text-center text-xs leading-relaxed text-neutral-400">Choose your saved address at checkout.</p>
      </aside>
    </div>}
  </Container>;
}
