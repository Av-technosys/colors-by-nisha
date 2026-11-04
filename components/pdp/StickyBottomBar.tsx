"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatINR, type ProductItem } from "@/data/products";


interface StickyBottomBarProps {
  product: ProductItem;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAdd: () => void;
}

export function StickyBottomBar({ product, quantity, onQuantityChange: setQuantity, onAdd }: StickyBottomBarProps) {
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(progress);

      // Trigger visibility when user scrolls past main PDP buy actions
      const buySection = document.getElementById("pdp-main-buy-actions");
      if (buySection) {
        const rect = buySection.getBoundingClientRect();
        setIsVisible(rect.bottom < 80);
      } else {
        setIsVisible(scrollTop > 420);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only render when the sticky strap is visible (NEVER outside the strap!)
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Sticky Add to Cart Bar"
      className="fixed inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300 bottom-[52px] md:bottom-0 py-2.5 md:py-3"
    >
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full flex items-center justify-between gap-4">
        {/* Desktop Left Side: Thumbnail & Product Name */}
        <div className="hidden md:flex items-center gap-3.5 min-w-0">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
            {(() => {
              const img = product.images?.[0] || "/Home/images/015_kesari_rang__IMG_0124.jpg";
              return (
                <Image
                  src={img}
                  unoptimized={typeof img === "string" && (img.startsWith("http") || img.startsWith("data:"))}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover object-top"
                />
              );
            })()}
          </div>
          <span className="font-display font-semibold text-sm lg:text-base text-ink uppercase tracking-wide truncate max-w-xs lg:max-w-md">
            {product.name}
          </span>
        </div>

        {/* Right Side: Price Pill, Quantity, Add to Cart & Inside-Strap Scroll-To-Top Button */}
        <div className="flex items-center gap-2.5 md:gap-3.5 w-full md:w-auto justify-between md:justify-end">
          {/* Price Pill with Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
              className="flex items-center justify-between gap-2 md:gap-3 rounded-md border border-neutral-300 bg-white px-3.5 md:px-4 py-2 text-xs md:text-sm font-bold text-ink shadow-2xs hover:border-neutral-400 transition cursor-pointer"
              aria-expanded={priceDropdownOpen}
            >
              <span>{formatINR(product.price)}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {priceDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-44 rounded-md bg-white border border-neutral-200 shadow-xl p-1.5 z-50 text-xs animate-in zoom-in-95 duration-150">
                <button
                  onClick={() => setPriceDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 font-medium text-ink transition cursor-pointer"
                >
                  {product.variants?.find(variant => variant.id === product.variantId)?.name || "Standard"} - {formatINR(product.price)}
                </button>
              </div>
            )}
          </div>

          {/* Quantity Pill (Desktop Only) */}
          <div className="hidden md:flex items-center justify-between rounded-md bg-[#f4f4f4] px-3.5 py-1.5 w-[110px] shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-base text-neutral-600 hover:text-ink font-medium px-1 cursor-pointer select-none"
              aria-label="Decrease quantity"
            >
              —
            </button>
            <span className="text-sm font-semibold text-ink select-none">{quantity}</span>
            <button
              disabled={!product.inStock || quantity >= (product.stockCount ?? Infinity)}
              onClick={() => setQuantity(Math.min(product.stockCount ?? Infinity, quantity + 1))}
              className="text-base text-neutral-600 hover:text-ink font-medium px-1 cursor-pointer select-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Navy ADD TO CART Button */}
          <button
            onClick={onAdd}
            disabled={!product.inStock}
            className="flex-1 md:flex-none rounded-md bg-[#2d254d] hover:bg-[#231c3d] py-2.5 px-5 md:px-8 font-display text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer text-center"
          >
            {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
          </button>

          {/* Scroll-To-Top Button INSIDE THE STRAP ONLY */}
          <button
            onClick={scrollToTop}
            className="back-to-top relative size-10 md:size-11 shrink-0 rounded-md overflow-hidden bg-white shadow-md border border-neutral-200 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            aria-label="Back to top"
            title="Back to top"
          >
            {/* Liquid Dark Fill that rises as you scroll */}
            <span
              className="absolute left-0 bottom-0 w-full bg-[#1e1e1e] transition-[height] duration-75 pointer-events-none"
              style={{ height: `${scrollProgress}%` }}
            />
            {/* Double Upward Chevron with mix-blend-difference */}
            <svg
              width="9"
              height="11"
              viewBox="0 0 8 10"
              fill="currentColor"
              className="relative z-10 text-white pointer-events-none"
              style={{ mixBlendMode: "difference" }}
            >
              <path d="M7.797 4.203h.016A.636.636 0 0 1 8 4.672a.67.67 0 0 1-.188.469.69.69 0 0 1-.484.187.67.67 0 0 1-.469-.187L4 2.28l-2.86 2.86a.69.69 0 0 1-.484.187.617.617 0 0 1-.453-.187A.644.644 0 0 1 0 4.67c0-.187.068-.343.203-.468L3.531.86A.636.636 0 0 1 4 .672c.188 0 .344.062.469.187l3.328 3.344Zm0 4.656h.016A.69.69 0 0 1 8 9.344a.617.617 0 0 1-.188.453.661.661 0 0 1-.953 0L4 6.937l-2.86 2.86A.661.661 0 0 1 .657 10a.594.594 0 0 1-.453-.203A.594.594 0 0 1 0 9.344c0-.188.068-.35.203-.485l3.328-3.328A.611.611 0 0 1 4 5.328c.188 0 .344.068.469.203L7.797 8.86Z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
