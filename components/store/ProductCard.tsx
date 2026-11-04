"use client";

import Image from "next/image";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { images, money, resolveHomeImage, type Product } from "@/data/home";
import { addRecentlyViewed } from "@/lib/store";
import {
  IoCloseOutline,
  IoEyeOutline,
  IoHeart,
  IoHeartOutline,
} from "react-icons/io5";

export interface ProductActions {
  saved: string[];
  toggleSave: (name: string) => void;
  onSelect: (product: Product) => void;
}

export interface ProductCardProps extends ProductActions {
  product: Product;
  featured?: boolean;
  duplicate?: boolean;
  variant?: "default" | "wishlist";
  className?: string;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({
  product,
  saved,
  toggleSave,
  onSelect,
  featured = false,
  duplicate = false,
  variant = "default",
  className,
  onAddToCart,
}: ProductCardProps) {
  const isSaved = saved.some((item) => {
    const itm = item.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const pName = product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const pSlug = product.slug ? product.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") : "";
    return itm === pName || (pSlug ? itm === pSlug : false);
  });

  const productSlug =
    product.slug ||
    product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  const handleSelect = () => {
    addRecentlyViewed(product.name);
    onSelect(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addRecentlyViewed(product.name);
    onSelect(product);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addRecentlyViewed(product.name);
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      onSelect(product);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(product.slug || product.name);
  };

  const primarySrc =
    product.imageSrc ||
    resolveHomeImage(product.image) ||
    "/product-placeholder.svg";

  const secondarySrc =
    product.secondSrc ||
    resolveHomeImage(product.second);

  const isPrimaryExternal =
    typeof primarySrc === "string" &&
    (primarySrc.startsWith("http") || primarySrc.startsWith("data:"));
  const isSecondaryExternal =
    typeof secondarySrc === "string" &&
    (secondarySrc.startsWith("http") || secondarySrc.startsWith("data:"));

  const defaultClass = featured
    ? "basis-full md:basis-[calc((100%_-_32px)/3)] lg:basis-[calc((100%_-_40px)/3)]"
    : "basis-[calc((100%_-_16px)/2)] md:basis-[calc((100%_-_32px)/3)] lg:basis-[calc((100%_-_60px)/4)]";

  return (
    <article
      aria-hidden={duplicate || undefined}
      className={`min-w-0 shrink-0 snap-start text-center flex flex-col ${
        className ?? defaultClass
      }`}
    >
      <div className="group relative aspect-2/3 overflow-hidden rounded-md bg-neutral-100 shadow-xs">
        {/* Main Product Image - Navigates directly to PDP */}
        <Link
          tabIndex={duplicate ? -1 : undefined}
          href={`/products/${productSlug}`}
          onClick={() => addRecentlyViewed(product.name)}
          className="absolute inset-0 size-full cursor-pointer"
          aria-label={`View ${product.name}`}
        >
          {primarySrc ? (
            <Image
              src={primarySrc}
              alt={product.name}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              unoptimized={isPrimaryExternal}
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none"
            />
          ) : (
            <Photo
              id={product.image}
              alt={product.name}
              className="transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none"
            />
          )}

          {secondarySrc ? (
            <Image
              src={secondarySrc}
              alt={`${product.name}, alternate view`}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              unoptimized={isSecondaryExternal}
              className="object-cover object-top opacity-0 transition duration-500 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none group-hover:opacity-100"
            />
          ) : (
            product.second && (
              <Photo
                id={product.second}
                alt={`${product.name}, alternate view`}
                className="opacity-0 transition duration-500 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none group-hover:opacity-100"
              />
            )
          )}
        </Link>

        {/* Top-Right Action Buttons (Wishlist/Remove + Quick View) */}
        <div className="absolute right-2.5 top-2.5 md:right-3.5 md:top-3.5 z-20 flex flex-col gap-2">
          {/* 1. Wishlist or Remove Button */}
          <div className="group/btn relative">
            <button
              tabIndex={duplicate ? -1 : undefined}
              className={`grid size-9 md:size-10 place-items-center rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 cursor-pointer ${
                variant === "wishlist"
                  ? "bg-white text-[#111111] hover:bg-[#111111] hover:text-white"
                  : isSaved
                  ? "bg-white text-[#e25353] hover:bg-[#111111] hover:text-white"
                  : "bg-white text-[#111111] hover:bg-[#111111] hover:text-white"
              }`}
              onClick={handleWishlistClick}
              aria-label={
                variant === "wishlist"
                  ? `Remove ${product.name} from wishlist`
                  : `${isSaved ? "Remove" : "Add"} ${product.name} ${
                      isSaved ? "from" : "to"
                    } wishlist`
              }
              aria-pressed={isSaved}
            >
              {variant === "wishlist" ? (
                <IoCloseOutline size={22} />
              ) : isSaved ? (
                <IoHeart size={20} className="fill-current" />
              ) : (
                <IoHeartOutline size={20} />
              )}
            </button>

            {/* Tooltip on the left with triangle arrow pointing right (Desktop hover only) */}
            <div className="hidden md:block pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 z-30">
              <div className="relative whitespace-nowrap rounded-md bg-[#111111] px-3 py-1.5 font-sans text-xs font-normal text-white shadow-md">
                {variant === "wishlist"
                  ? "Remove from wishlist"
                  : isSaved
                  ? "Remove from wishlist"
                  : "Add to wishlist"}
                <span className="absolute left-full top-1/2 -translate-y-1/2 h-0 w-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-[#111111] border-r-0" />
              </div>
            </div>
          </div>

          {/* 2. Quick View (Eye) Button - Exclusively opens Quick View Modal */}
          <div className="group/eye relative">
            <button
              type="button"
              tabIndex={duplicate ? -1 : undefined}
              className="grid size-9 md:size-10 place-items-center rounded-md bg-white text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-[#111111] hover:text-white transition-all duration-200 cursor-pointer"
              onClick={handleQuickViewClick}
              aria-label={`Quick view ${product.name}`}
            >
              <IoEyeOutline size={20} />
            </button>

            {/* Quick View Tooltip (Desktop hover only) */}
            <div className="hidden md:block pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 opacity-0 group-hover/eye:opacity-100 transition-opacity duration-200 z-30">
              <div className="relative whitespace-nowrap rounded-md bg-[#111111] px-3 py-1.5 font-sans text-xs font-normal text-white shadow-md">
                Quick view
                <span className="absolute left-full top-1/2 -translate-y-1/2 h-0 w-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-[#111111] border-r-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating "Add To Cart" Pill Button */}
        <div className="absolute inset-x-3 bottom-3 md:inset-x-4 md:bottom-4 z-20">
          <button
            tabIndex={duplicate ? -1 : undefined}
            className="w-full rounded-md bg-white py-2.5 md:py-3 px-4 text-center font-display text-[13px] md:text-[15px] font-medium text-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:bg-[#2d254d] hover:text-[#FCF1D8] transition-all duration-300 cursor-pointer active:scale-95"
            onClick={handleCartClick}
          >
            Add To Cart
          </button>
        </div>
      </div>

      {/* Product Details - Product Name Navigates Directly to PDP */}
      <Link
        tabIndex={duplicate ? -1 : undefined}
        href={`/products/${productSlug}`}
        onClick={() => addRecentlyViewed(product.name)}
        className="mt-3 font-display text-sm leading-snug md:mt-4 md:text-[15px] hover:text-purple transition-colors cursor-pointer text-ink font-medium"
      >
        {product.name}
      </Link>
      <p className="mt-1 font-sans text-sm text-neutral-700 md:text-[15px]">
        {money(product.price)}
      </p>
    </article>
  );
}
