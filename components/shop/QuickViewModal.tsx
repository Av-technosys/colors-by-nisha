"use client";

import { selectVariant, variantName } from "@/helpers/store/variant";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR, type ProductItem } from "@/data/products";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
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
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [purchaseError, setPurchaseError] = useState("");

  if (!product) return null;

  const wishlisted = isWishlisted(product.slug);
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1 && !product.variants?.every(v => {
    const n = v.name.toLowerCase().trim();
    return n === "standard" || n === "default title" || n === "title";
  });
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
    setPurchaseError("");
    if (!addToCart(product, variantName(product), quantity)) {
      setPurchaseError("This quantity cannot be added. Check available stock or review the item already in your cart.");
      return;
    }
    onClose();
    setCartOpen(true);
  };

  const handleBuyItNow = () => {
    if (!product.inStock) return;
    setPurchaseError("");
    if (!addToCart(product, variantName(product), quantity)) {
      setPurchaseError("This quantity cannot be added. Review your cart before checkout.");
      return;
    }
    setCartOpen(false);
    onClose();
    router.push("/checkout");
  };

  const handleGoToPDP = () => {
    onClose();
    router.push(`/products/${product.slug}`);
  };

  return (
    <Modal title={product.name} onClose={onClose} className="w-full max-w-[960px]">
      <div
        className="relative flex w-full min-w-0 flex-col rounded-md bg-white shadow-2xl animate-in zoom-in-95 duration-200 md:flex-row"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Product Image with Floating Left/Right Arrows */}
        <div className="relative flex shrink-0 items-center justify-center overflow-hidden bg-neutral-100 md:w-1/2">
          <div
            onClick={handleGoToPDP}
            className="group relative h-[32dvh] min-h-40 w-full cursor-pointer overflow-hidden md:aspect-2/3 md:h-auto md:min-h-full"
            title="Click to view full product details"
          >
            <Image
              src={activeImage}
              unoptimized={activeImage.startsWith("http")}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-contain object-top transition-transform duration-500 group-hover:scale-102 md:object-cover"
              priority
            />
          </div>

          {/* Floating Navigation Arrows (Matches Screenshot!) */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid size-8 md:size-9 place-items-center rounded-md bg-white/90 text-ink shadow-md transition hover:bg-white hover:scale-105 cursor-pointer"
                aria-label="Previous image"
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 1L2 6l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid size-8 md:size-9 place-items-center rounded-md bg-white/90 text-ink shadow-md transition hover:bg-white hover:scale-105 cursor-pointer"
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
          className="relative flex min-w-0 flex-1 flex-col space-y-4 p-4 sm:p-6 md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:p-8"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Product Title (Links to PDP) */}
          <div className="pr-8">
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="group inline-block"
            >
              <h2 className="break-words font-display text-xl md:text-3xl font-bold uppercase tracking-tight text-ink group-hover:text-neutral-700 transition leading-snug">
                {product.name}
              </h2>
            </Link>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-center gap-3">
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
          <p className="text-sm md:text-[15px] text-neutral-600 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {hasMultipleVariants && <label className="space-y-2 text-sm">
            <span className="block font-medium">Choose an option</span>
            <select value={variantId} onChange={event => { setVariantId(event.target.value); setPurchaseError(""); setQuantity(1); setActiveImageIdx(0); }} className="w-full rounded-md border border-neutral-300 bg-white p-3">
              {product.variants?.map(variant => <option key={variant.id} value={variant.id}>{variant.name}{variant.stock === 0 ? " — Out of stock" : ""}</option>)}
            </select>
          </label>}
          {/* Action Row: Pill Quantity, Navy ADD TO CART, Wishlist Heart */}
          <div className="space-y-3.5 pt-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Pill Quantity Selector */}
              <div className="flex items-center justify-between rounded-md bg-[#f4f4f4] px-4 py-2.5 w-[115px] shrink-0">
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

              <Button type="button" variant="hero" onClick={handleAddToCart} disabled={!product.inStock} className="min-w-0! flex-1 px-3! disabled:cursor-not-allowed disabled:opacity-50">{product.inStock ? "Add to cart" : "Out of stock"}</Button>

              {/* Circular Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.slug)}
                className={`size-11 shrink-0 rounded-md border border-neutral-300 flex items-center justify-center transition-colors cursor-pointer ${
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

            {purchaseError && <p role="alert" className="text-sm text-[#9e5144]">{purchaseError}</p>}

            <Button type="button" variant="hero" disabled={!product.inStock} onClick={handleBuyItNow} className="w-full disabled:cursor-not-allowed disabled:opacity-50">Buy now</Button>
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
    </Modal>
  );
}
