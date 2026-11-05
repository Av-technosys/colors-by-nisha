"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, Truck, Package } from "lucide-react";
import { formatINR } from "@/data/products";
import { useStore } from "./StoreContext";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity } = useStore();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Terms agreement state
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [termsError, setTermsError] = useState(false);

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

  // Lock body scroll when open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  if (!cartOpen) return null;

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Free shipping threshold
  const freeShippingThreshold = 10000;
  const progressPercent = Math.min(100, Math.round((total / freeShippingThreshold) * 100));
  const hasFreeShipping = total >= freeShippingThreshold;

  const handleCheckout = () => {
    if (!termsAgreed) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
      style={{ overscrollBehavior: "contain" }}
      onClick={() => setCartOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-[460px] sm:max-w-[480px] flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-right duration-300"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header: Shopping Cart (Count) + Close button */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="font-display text-base sm:text-lg font-bold tracking-tight text-ink">
            Shopping Cart ({totalCount})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1.5 text-neutral-500 hover:text-ink transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* 2. Free Shipping Bar (Matches Reference Screenshot) */}
        <div className="px-6 py-3.5 border-b border-neutral-100 bg-white">
          <div className="relative my-2">
            {/* Background track */}
            <div className="h-1 w-full bg-neutral-200 rounded-md overflow-hidden">
              <div
                className="h-full bg-[#1b7a4d] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Truck Icon at tip of progress bar */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-5 rounded-md border border-[#1b7a4d] bg-white flex items-center justify-center text-[#1b7a4d] shadow-2xs transition-all duration-500"
              style={{ left: `${progressPercent}%` }}
            >
              <Truck size={10} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-neutral-600 font-sans tracking-wide">
            {hasFreeShipping ? (
              <span className="text-[#1b7a4d] font-medium">
                Congratulations! You&apos;ve got free shipping!
              </span>
            ) : (
              <span>
                Add{" "}
                <span className="font-semibold text-ink">
                  {formatINR(freeShippingThreshold - total)}
                </span>{" "}
                more to get free shipping!
              </span>
            )}
          </p>
        </div>

        {/* 3. Items List Area */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100"
          style={{ overscrollBehavior: "contain" }}
        >
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-16">
              <div className="mb-4 grid size-16 place-items-center rounded-md bg-neutral-100 text-neutral-400">
                <Package size={28} strokeWidth={1.5} />
              </div>
              <p className="font-display text-lg text-ink font-medium">Your shopping cart is empty</p>
              <p className="mt-1 text-xs text-neutral-500 font-sans max-w-xs">
                Explore our handcrafted lehengas, silk sarees, and occasion collections.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-6 inline-block border border-neutral-900 bg-ink px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => {
              const itemImage = item.image || "/Home/images/015_kesari_rang__IMG_0124.jpg";
              return (
              <div
                key={`${item.slug}-${item.size}-${index}`}
                className="flex items-start gap-4 py-4 first:pt-0"
              >
                {/* Product Thumbnail */}
                <Link
                  href={`/products/${item.slug}`}
                  onClick={() => setCartOpen(false)}
                  className="relative size-20 sm:size-22 shrink-0 overflow-hidden rounded-md bg-neutral-100 border border-neutral-100 group"
                >
                  <Image
                    src={itemImage}
                    unoptimized={typeof itemImage === "string" && (itemImage.startsWith("http") || itemImage.startsWith("data:"))}
                    alt={item.name}
                    fill
                    sizes="88px"
                    className="object-cover object-top transition duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Details Column */}
                <div className="flex flex-1 flex-col min-w-0 justify-between self-stretch">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="font-display text-xs sm:text-sm font-bold tracking-wider text-ink uppercase hover:underline line-clamp-1 block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs sm:text-sm font-medium text-neutral-800 mt-1 font-sans">
                      {formatINR(item.price)}
                    </p>
                    {item.size && item.size !== "Standard" && (
                      <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                        {["XS", "S", "M", "L", "XL", "XXL", "Custom"].includes(item.size) ? `Size: ${item.size}` : `Option: ${item.size}`}
                      </p>
                    )}
                  </div>

                  {/* Quantity Pill + Trash Icon Row (Matches Screenshot) */}
                  <div className="flex items-center justify-between mt-3 pt-1">
                    {/* Pill Quantity Counter: - 1 + */}
                    <div className="inline-flex items-center bg-[#f4f4f4] rounded-md border border-neutral-200/80 px-1 py-0.5">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="px-2.5 py-0.5 text-xs text-neutral-600 hover:text-ink select-none font-medium transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold text-ink min-w-[20px] text-center font-sans">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="px-2.5 py-0.5 text-xs text-neutral-600 hover:text-ink select-none font-medium transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Trash Delete Icon */}
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-neutral-400 hover:text-red-600 p-1 transition cursor-pointer"
                      aria-label="Remove product"
                      title="Remove product"
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>

        {/* 4. Bottom Section: Quick Tool Tabs + Subtotal + Terms + Buttons */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 bg-white px-6 py-4 space-y-3">
            <p className="text-xs leading-relaxed text-neutral-500">Shipping charges will be confirmed separately.</p>

            {/* Subtotal Row (Matches Screenshot: Subtotal Rs. 24,500.00) */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-ink font-sans">Subtotal</span>
              <span className="font-display text-base font-bold text-ink">
                {formatINR(total)}
              </span>
            </div>

            {/* Terms & Conditions Checkbox (Matches Screenshot) */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 font-sans select-none">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => {
                    setTermsAgreed(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="size-3.5 rounded-md border-neutral-300 text-purple focus:ring-purple cursor-pointer"
                />
                <span>
                  I agree with{" "}
                  <Link
                    href="/terms-and-conditions"
                    onClick={() => setCartOpen(false)}
                    className="text-ink font-semibold underline underline-offset-2 hover:text-neutral-700"
                  >
                    Terms & Conditions
                  </Link>
                </span>
              </label>
              {termsError && (
                <p className="text-[11px] text-red-600 font-medium mt-1">
                  Please agree to the Terms & Conditions before checkout.
                </p>
              )}
            </div>

            {/* Action Buttons: VIEW CART & CHECKOUT (Matches Reference Screenshot) */}
            <div className="space-y-2 pt-2">
              {/* VIEW CART: Outline Button */}
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="block w-full text-center border border-neutral-900 bg-white py-3 px-4 text-xs font-bold tracking-widest uppercase text-ink hover:bg-neutral-50 transition rounded-none shadow-2xs"
              >
                VIEW CART
              </Link>

              {/* CHECKOUT: Purple / Slate Solid Button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="block w-full text-center bg-[#786c87] py-3.5 px-4 text-xs font-bold tracking-widest uppercase text-white hover:bg-[#685c76] transition rounded-none shadow-xs cursor-pointer"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
