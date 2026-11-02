"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/data/products";
import { useStore } from "./StoreContext";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity } = useStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cartOpen) {
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px] transition-opacity"
      style={{ overscrollBehavior: "contain" }}
      onClick={() => setCartOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-right duration-300"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-medium tracking-wide text-ink">Shopping Bag</h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="grid size-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink transition-colors"
            aria-label="Close cart"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="bg-[#effafb] px-6 py-3 border-b border-[#d8f0f3] text-xs text-[#1e6f77]">
          {total >= 10000 ? (
            <p className="font-medium text-center">🎉 You qualify for Free Domestic Shipping across India!</p>
          ) : (
            <p className="text-center">
              Add <span className="font-semibold">{formatINR(10000 - total)}</span> more for Free Shipping!
            </p>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ overscrollBehavior: "contain" }}>
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-16">
              <div className="mb-4 grid size-16 place-items-center rounded-full bg-neutral-100 text-neutral-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-display text-lg text-ink font-medium">Your shopping bag is empty</p>
              <p className="mt-1 text-sm text-neutral-500">Discover our handcrafted festive & bridal collections.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-6 inline-block rounded bg-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.slug}-${item.size}-${index}`} className="flex gap-4 border-b border-neutral-100 pb-5">
                <div className="relative aspect-2/3 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover object-top" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="font-display text-sm font-medium uppercase tracking-wide text-ink hover:underline line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-xs text-neutral-400 hover:text-red-600 transition"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">Size: <span className="font-medium text-ink">{item.size}</span></p>
                    <p className="font-display text-sm font-semibold text-ink mt-1.5">{formatINR(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center rounded border border-neutral-200">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 transition"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-medium text-ink min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50/70 p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-display text-base font-semibold text-ink">{formatINR(total)}</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-normal">
              Taxes included. Shipping & customs calculated during checkout. Handcrafted orders are tailored with precision.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <a
                href={`https://wa.me/919799330455?text=${encodeURIComponent(
                  `Hello Colors by Nisha! I would like to place an order for:\n${cart
                    .map((i) => `• ${i.name} (Size: ${i.size}, Qty: ${i.quantity}) - ${formatINR(i.price)}`)
                    .join("\n")}\nTotal: ${formatINR(total)}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded bg-[#25D366] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#20b858] transition shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.121-.527-1.464-.616-2.45-2.094-2.527-2.197-.077-.103-.623-.83-.623-1.583 0-.753.394-1.123.534-1.272.14-.149.306-.186.408-.186.103 0 .205.002.296.006.096.004.225-.036.352.27.13.313.447 1.09.486 1.17.039.08.065.174.013.279-.052.105-.078.17-.156.262-.078.092-.164.205-.235.275-.079.079-.161.165-.069.323.092.158.409.675.877 1.092.602.537 1.109.703 1.267.782.158.079.251.069.345-.04.094-.108.405-.472.513-.633.108-.161.216-.134.364-.079.148.055.938.442 1.099.522.161.08.269.119.308.186.039.067.039.389-.105.794z" />
                </svg>
                Complete Order via WhatsApp
              </a>
              <button
                onClick={() => alert("Checkout will be connected with Shopify Payments backend. You can order directly via WhatsApp or contact colorbynishavijay@gmail.com.")}
                className="flex items-center justify-center rounded bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

