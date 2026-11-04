"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useStore } from "@/components/store/StoreContext";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  productSlug: string;
}

export function ProductGallery({ images, productName, productSlug }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { isWishlisted, toggleWishlist } = useStore();
  const wishlisted = isWishlisted(productSlug);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeImage = images[activeIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      handleNext();
    } else if (distance < -40) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
        {/* Desktop Vertical Thumbnails */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-3 overflow-x-hidden overflow-y-auto max-h-[680px] shrink-0 no-scrollbar px-1 py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-2/3 w-16 lg:w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                  activeIndex === idx
                    ? "border-ink ring-1 ring-ink"
                    : "border-transparent opacity-65 hover:opacity-100"
                }`}
                aria-label={`Thumbnail ${idx + 1}`}
              >
                <Image
                  src={img}
              unoptimized={img.startsWith("http")}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image Container */}
        <div className="relative flex-1">
          <div
            className="group relative aspect-2/3 w-full overflow-hidden rounded-md bg-neutral-100 cursor-zoom-in shadow-xs"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setLightboxOpen(true)}
          >
            {/* Active Image */}
            <Image
              src={activeImage}
              unoptimized={activeImage.startsWith("http")}
              alt={productName}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={`object-cover object-top transition-transform duration-300 ease-out ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    }
                  : undefined
              }
            />

            {/* Top Right Floating Wishlist Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(productSlug);
              }}
              className={`absolute right-3.5 top-3.5 z-10 grid size-10 place-items-center rounded-md bg-white shadow-md transition-all hover:scale-105 cursor-pointer ${
                wishlisted ? "text-[#d0473e]" : "text-neutral-700 hover:text-ink"
              }`}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={wishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Bottom Right Image Counter Badge (Matches Screenshot: "1/3" or "1/4") */}
            {images.length > 1 && (
              <div className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-ink shadow-xs pointer-events-none">
                {activeIndex + 1}/{images.length}
              </div>
            )}

            {/* Desktop Navigation Arrows on Hover */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="hidden md:grid absolute left-3 top-1/2 -translate-y-1/2 size-10 place-items-center rounded-md bg-white/80 backdrop-blur-xs text-ink shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white cursor-pointer"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="hidden md:grid absolute right-3 top-1/2 -translate-y-1/2 size-10 place-items-center rounded-md bg-white/80 backdrop-blur-xs text-ink shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white cursor-pointer"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Mobile swipe dots */}
            {images.length > 1 && (
              <div className="md:hidden absolute bottom-3.5 left-4 flex gap-1 z-10 pointer-events-none">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-md transition-all ${
                      activeIndex === i ? "bg-white w-4" : "bg-white/60 w-1.5"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          style={{ overscrollBehavior: "contain" }}
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 z-20 grid size-10 place-items-center rounded-md bg-white/20 text-white hover:bg-white/40 transition text-xl cursor-pointer"
            aria-label="Close lightbox"
          >
            ✕
          </button>
          <div
            className="relative h-[85vh] w-[90vw] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage}
              unoptimized={activeImage.startsWith("http")}
              alt={productName}
              fill
              className="object-contain"
              sizes="90vw"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-md bg-black/40 text-white hover:bg-black/60 transition text-2xl cursor-pointer"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-md bg-black/40 text-white hover:bg-black/60 transition text-2xl cursor-pointer"
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
