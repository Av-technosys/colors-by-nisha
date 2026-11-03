"use client";

import { selectVariant, variantName } from "@/helpers/store/variant";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR, type ProductItem } from "@/data/products";
import { useStore } from "@/components/store/StoreContext";

interface QuickViewModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export function QuickViewModal({ product: originalProduct, onClose }: QuickViewModalProps) {
  const [variantId, setVariantId] = useState(originalProduct?.variants?.find(variant => variant.stock !== 0)?.id || originalProduct?.variants?.[0]?.id || "");
  const product = originalProduct ? selectVariant(originalProduct, variantId) : null;
  const router = useRouter();
  const { addToCart, setCartOpen, isWishlisted, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product.slug);
  const images = product.images.length > 0 ? product.images : ["/Home/images/010_flamingo_fable__IMG_0053.jpg"];
  const activeImage = images[activeImageIdx] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;
    if (!agreedTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setIsAdding(true);
    addToCart(product, variantName(product), quantity);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
      setCartOpen(true);
    }, 350);
  };

  const handleBuyItNow = () => {
    if (!product.inStock) return;
    if (!agreedTerms) {
      setTermsError(true);
      return;
    }
    addToCart(product, variantName(product), quantity);
    const text = encodeURIComponent(
      `Hello Colors by Nisha! I want to Buy Now:\n• Product: ${product.name}\n• Option: ${variantName(product)}\n• Qty: ${quantity}\n• Total: ${formatINR(
        product.price * quantity
      )}\nLink: https://colorsbynisha.com/products/${product.slug}`
    );
    window.open(`https://wa.me/919799330455?text=${text}`, "_blank");
    onClose();
  };

  const handleGoToPDP = () => {
    onClose();
    router.push(`/products/${product.slug}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 md:p-6 backdrop-blur-xs animate-in fade-in duration-200"
      style={{ overscrollBehavior: "contain" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="relative flex w-full max-w-[960px] flex-col md:flex-row overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh]"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Product Image with Floating Left/Right Arrows */}
        <div className="relative md:w-1/2 bg-neutral-100 flex items-center justify-center overflow-hidden">
          <div
            onClick={handleGoToPDP}
            className="group relative aspect-2/3 w-full cursor-pointer overflow-hidden"
            title="Click to view full product details"
          >
            <Image
              src={activeImage}
              unoptimized={activeImage.startsWith("http")}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-102"
              priority
            />
          </div>

          {/* Floating Navigation Arrows (Matches Screenshot!) */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid size-8 md:size-9 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white hover:scale-105 cursor-pointer"
                aria-label="Previous image"
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 1L2 6l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid size-8 md:size-9 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white hover:scale-105 cursor-pointer"
                aria-label="Next image"
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Right Side: Exact Fields Matching colorsbynisha.com Quick View */}
        <div
          className="relative flex flex-1 flex-col overflow-y-auto p-6 md:p-8 space-y-4 no-scrollbar"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 size-8 grid place-items-center rounded-full text-neutral-400 hover:text-ink transition hover:bg-neutral-100 cursor-pointer"
            aria-label="Close dialog"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
            </svg>
          </button>

          {/* Product Title (Links to PDP) */}
          <div className="pr-8">
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="group inline-block"
            >
              <h2 className="font-display text-2xl md:text-[28px] font-bold uppercase tracking-tight text-ink group-hover:text-neutral-700 transition leading-snug">
                {product.name}
              </h2>
            </Link>
          </div>

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

          {/* Description Paragraph */}
          <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {!!product.variants?.length && <label className="space-y-2 text-sm">
            <span className="block font-medium">Choose an option</span>
            <select value={variantId} onChange={event => { setVariantId(event.target.value); setQuantity(1); setActiveImageIdx(0); }} className="w-full rounded-md border border-neutral-300 bg-white p-3">
              {product.variants.map(variant => <option key={variant.id} value={variant.id}>{variant.name}{variant.stock === 0 ? " — Out of stock" : ""}</option>)}
            </select>
          </label>}
          {/* Action Row: Pill Quantity, Navy ADD TO CART, Wishlist Heart */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3">
              {/* Pill Quantity Selector */}
              <div className="flex items-center justify-between rounded-full bg-[#f4f4f4] px-4 py-2.5 w-[115px] shrink-0">
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

              {/* Navy ADD TO CART button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !product.inStock}
                className="flex-1 rounded-md bg-[#2d254d] hover:bg-[#231c3d] py-3.5 px-4 font-display text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer text-center"
              >
                {!product.inStock ? "OUT OF STOCK" : isAdding ? "ADDING..." : "ADD TO CART"}
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
                id="modal-terms-check"
                checked={agreedTerms}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked);
                  if (e.target.checked) setTermsError(false);
                }}
                className="size-4 rounded border-neutral-300 accent-[#2d254d] cursor-pointer"
              />
              <label htmlFor="modal-terms-check" className="cursor-pointer select-none">
                I agree with <strong className="font-semibold text-ink">Terms & Conditions</strong>
              </label>
            </div>
            {termsError && (
              <p className="text-xs text-red-600 font-medium">Please accept the Terms & Conditions.</p>
            )}

            {/* Coral / Salmon Buy It Now Button */}
            <button
              disabled={!product.inStock}
              onClick={handleBuyItNow}
              className="w-full rounded-md bg-[#dd8984] hover:bg-[#d07b76] py-3.5 px-6 font-display text-xs md:text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer text-center tracking-wide"
            >
              Buy It Now
            </button>
          </div>

          {/* Full Details Redirect Link */}
          <div className="pt-2 text-center">
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-ink underline underline-offset-4 transition"
            >
              View full details
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
