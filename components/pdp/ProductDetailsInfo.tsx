"use client";

import React, { useState } from "react";
import { formatINR, type ProductItem } from "@/data/products";
import { useStore } from "@/components/store/StoreContext";

interface ProductDetailsInfoProps {
  product: ProductItem;
}

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  const { addToCart, setCartOpen, isWishlisted, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const wishlisted = isWishlisted(product.slug);
  const details = product.details || {};

  const handleAddToCart = () => {
    if (!agreedTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setIsAdding(true);
    addToCart(product, "Standard", quantity);
    setTimeout(() => {
      setIsAdding(false);
      setCartOpen(true);
    }, 350);
  };

  const handleBuyItNow = () => {
    if (!agreedTerms) {
      setTermsError(true);
      return;
    }
    addToCart(product, "Standard", quantity);
    const text = encodeURIComponent(
      `Hello Colors by Nisha! I would like to Buy Now:\n• Product: ${product.name}\n• Qty: ${quantity}\n• Total: ${formatINR(
        product.price * quantity
      )}\nLink: https://colorsbynisha.com/products/${product.slug}`
    );
    window.open(`https://wa.me/919799330455?text=${text}`, "_blank");
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Colors by Nisha`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Product Title */}
      <h1 className="font-display text-2xl md:text-3xl lg:text-[32px] font-bold tracking-tight text-ink uppercase leading-tight">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="font-display text-xl md:text-2xl font-bold text-ink">
          {formatINR(product.price)}
        </span>
        {product.originalPrice && (
          <span className="text-base text-neutral-400 line-through">
            {formatINR(product.originalPrice)}
          </span>
        )}
      </div>

      {/* Actions Section: ID used for sticky mobile bar trigger */}
      <div id="pdp-main-buy-actions" className="space-y-3.5 pt-1">
        {/* Row: Pill Quantity, Navy ADD TO CART, Wishlist Heart */}
        <div className="flex items-center gap-3">
          {/* Pill Quantity Selector */}
          <div className="flex items-center justify-between rounded-full bg-[#f4f4f4] px-4 py-2.5 w-[115px] md:w-[125px] shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-base text-neutral-600 hover:text-ink font-medium px-1 cursor-pointer select-none"
              aria-label="Decrease quantity"
            >
              —
            </button>
            <span className="text-sm font-semibold text-ink select-none">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-base text-neutral-600 hover:text-ink font-medium px-1 cursor-pointer select-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Navy ADD TO CART Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 rounded-md bg-[#2d254d] hover:bg-[#231c3d] py-3.5 px-4 font-display text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer text-center"
          >
            {isAdding ? "ADDING..." : "ADD TO CART"}
          </button>

          {/* Circular Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product.slug)}
            className={`size-11 shrink-0 rounded-full border border-neutral-300 flex items-center justify-center transition-colors cursor-pointer ${
              wishlisted
                ? "border-red-400 bg-red-50 text-red-600"
                : "bg-white text-neutral-600 hover:border-ink hover:text-ink"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={wishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-center gap-2 text-xs text-neutral-700 pt-0.5">
          <input
            type="checkbox"
            id="terms-check"
            checked={agreedTerms}
            onChange={(e) => {
              setAgreedTerms(e.target.checked);
              if (e.target.checked) setTermsError(false);
            }}
            className="size-4 rounded border-neutral-300 accent-[#2d254d] cursor-pointer"
          />
          <label htmlFor="terms-check" className="cursor-pointer select-none">
            I agree with <strong className="font-semibold text-ink">Terms & Conditions</strong>
          </label>
        </div>
        {termsError && (
          <p className="text-xs text-red-600 font-medium">Please accept the Terms & Conditions.</p>
        )}

        {/* Coral / Salmon Buy It Now Button */}
        <button
          onClick={handleBuyItNow}
          className="w-full rounded-md bg-[#dd8984] hover:bg-[#d07b76] py-3.5 px-6 font-display text-xs md:text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer text-center tracking-wide"
        >
          Buy It Now
        </button>

        {/* Utility Links: Ask a question & Share */}
        <div className="flex items-center gap-6 pt-1 text-xs text-neutral-600 font-medium">
          <button
            onClick={() => setAskModalOpen(true)}
            className="flex items-center gap-1.5 hover:text-ink transition cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Ask a question
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-ink transition cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>

          {shareToast && (
            <span className="text-[11px] text-emerald-600 font-semibold animate-in fade-in">
              Link copied!
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-neutral-200 my-2" />

      {/* Exact Bullet Specifications */}
      <div className="space-y-2 text-xs md:text-sm text-neutral-700 leading-relaxed pt-1">
        {details.noOfComponents && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">No. of Components:</strong>{" "}
              {details.noOfComponents}
            </p>
          </div>
        )}

        {details.components && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Components:</strong>{" "}
              {details.components}
            </p>
          </div>
        )}

        {details.noteworthyFeatures && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Noteworthy Features:</strong>{" "}
              {details.noteworthyFeatures}
            </p>
          </div>
        )}

        {details.occasion && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Occasion:</strong>{" "}
              {details.occasion}
            </p>
          </div>
        )}

        {details.style && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Style:</strong>{" "}
              {details.style}
            </p>
          </div>
        )}

        {details.pattern && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Pattern:</strong>{" "}
              {details.pattern}
            </p>
          </div>
        )}

        {(details.typeOfWork || details.work) && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Type of Work:</strong>{" "}
              {details.typeOfWork || details.work}
            </p>
          </div>
        )}

        {details.fabric && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Fabric:</strong>{" "}
              {details.fabric}
            </p>
          </div>
        )}

        {details.colour && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 font-bold">•</span>
            <p>
              <strong className="font-semibold text-ink">Colour:</strong>{" "}
              {details.colour}
            </p>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {askModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          style={{ overscrollBehavior: "contain" }}
          onClick={() => setAskModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-display font-semibold text-base text-ink uppercase">Have a question?</h3>
              <button
                onClick={() => setAskModalOpen(false)}
                className="text-neutral-400 hover:text-ink text-sm p-1 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-600 leading-relaxed">
              Our stylists are here to assist with sizing, customization, blouse adjustments, or delivery schedules for{" "}
              <strong className="text-ink">{product.name}</strong>.
            </p>
            <div className="mt-5 space-y-2.5">
              <a
                href={`https://wa.me/919799330455?text=${encodeURIComponent(
                  `Hi Colors by Nisha! I have a question regarding: ${product.name} (${formatINR(product.price)})`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded bg-[#25D366] hover:bg-[#20ba59] py-3 px-4 text-xs font-semibold uppercase text-white shadow-xs transition"
              >
                Chat with Stylist on WhatsApp
              </a>
              <a
                href="mailto:colorbynishavijay@gmail.com"
                className="flex items-center justify-center gap-2 rounded border border-neutral-300 py-2.5 px-4 text-xs font-semibold uppercase text-neutral-700 hover:bg-neutral-50 transition"
              >
                Email: colorbynishavijay@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
