"use client";

import React from "react";
import { getRelatedProducts, getAllProducts, type ProductItem } from "@/data/products";
import { ShopProductCard } from "@/components/shop/ShopProductCard";

interface RelatedProductsSectionProps {
  currentProduct: ProductItem;
  onQuickView?: (product: ProductItem) => void;
}

export function RelatedProductsSection({ currentProduct, onQuickView }: RelatedProductsSectionProps) {
  const related = getRelatedProducts(currentProduct.slug, 4);
  const allProds = getAllProducts();
  const recentlyViewed = allProds
    .filter((p) => p.slug !== currentProduct.slug && !related.some((r) => r.slug === p.slug))
    .slice(0, 4);

  return (
    <div className="space-y-16 py-12 border-t border-neutral-200">
      {/* People Also Bought (Matches Screenshot 2) */}
      <section>
        <div className="text-center mb-8 px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink">
            People Also Bought
          </h2>
          <p className="mt-1.5 text-xs md:text-sm text-neutral-500 max-w-lg mx-auto">
            Here&apos;s some of our most similar products people are buying. Click to discover trending style.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {related.map((prod) => (
            <ShopProductCard key={prod.id} product={prod} onQuickView={onQuickView} />
          ))}
        </div>
      </section>

      {/* Recently Viewed (Matches Screenshot 3) */}
      {recentlyViewed.length > 0 && (
        <section className="pt-6">
          <div className="text-center mb-8 px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink">
              Recently Viewed
            </h2>
            <p className="mt-1.5 text-xs md:text-sm text-neutral-500 max-w-xl mx-auto">
              Explore your recently viewed items, blending quality and style for a refined living experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {recentlyViewed.map((prod) => (
              <ShopProductCard key={prod.id} product={prod} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
