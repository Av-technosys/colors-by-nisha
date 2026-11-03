"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR, type ProductItem } from "@/data/products";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/store/StoreContext";

interface ShopProductCardProps {
  product: ProductItem;
  onQuickView?: (product: ProductItem) => void;
}

export function ShopProductCard({ product, onQuickView }: ShopProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isWishlisted, addToCart } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const wishlisted = isWishlisted(product.slug);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    if (product.variants?.length) {
      if (onQuickView) onQuickView(product);
      else router.push(`/products/${product.slug}`);
      return;
    }
    setIsAdding(true);
    addToCart(product, "Standard", 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || product.images[0];

  return (
    <article className="group relative flex flex-col text-center">
      {/* Media container */}
      <div className="relative aspect-2/3 w-full overflow-hidden rounded bg-neutral-100 shadow-2xs">
        <Link
          href={`/products/${product.slug}`}
          className="relative block size-full"
          aria-label={product.name}
        >
          {/* First image */}
          <Image
            src={primaryImage}
              unoptimized={primaryImage.startsWith("http")}
            alt={product.name}
            fill
            sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={`object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
              product.images.length > 1 ? "group-hover:opacity-0" : ""
            }`}
          />

          {/* Secondary image on hover */}
          {product.images.length > 1 && (
            <Image
              src={secondaryImage}
              unoptimized={secondaryImage.startsWith("http")}
              alt={`${product.name} alternate view`}
              fill
              sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="absolute inset-0 object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute left-2.5 top-2.5 z-10 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-white shadow-xs ${
              product.badge === "Sale" ? "bg-[#d0473e]" : "bg-neutral-800"
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Top Right Wishlist & Quick Actions */}
        <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1.5 transition-opacity">
          <button
            onClick={handleWishlist}
            className={`grid size-8 md:size-9 place-items-center rounded-full bg-white shadow-md transition-all hover:scale-110 ${
              wishlisted ? "text-[#d0473e]" : "text-neutral-700 hover:text-ink"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={wishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Quick View Button on desktop hover */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="hidden md:grid size-9 place-items-center rounded-full bg-white text-neutral-700 shadow-md opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 hover:text-ink hover:scale-110"
              aria-label="Quick view"
              title="Quick view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Add To Cart Button at bottom of card on hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 hidden md:block">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || !product.inStock}
            className="w-full translate-y-2 rounded bg-white/95 backdrop-blur-xs py-2.5 px-3 font-display text-xs font-semibold uppercase tracking-wider text-ink shadow-md opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-ink hover:text-white"
          >
            {!product.inStock ? "Out of Stock" : isAdding ? "Adding..." : product.variants?.length ? "Choose Options" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-3.5 flex flex-col items-center">
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-[13px] md:text-sm font-medium tracking-wide uppercase text-ink hover:text-[#a66c40] transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="font-display text-[13px] md:text-sm font-semibold text-ink">
            {formatINR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
