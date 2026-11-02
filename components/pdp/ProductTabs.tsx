"use client";

import React from "react";
import type { ProductItem } from "@/data/products";

interface ProductTabsProps {
  product: ProductItem;
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <section className="pt-8 md:pt-14 pb-8 border-t border-neutral-200">
      {/* Single Description Tab with Underline (Matches colorsbynisha.com screenshot) */}
      <div className="border-b border-neutral-200">
        <button
          type="button"
          className="pb-3 text-sm md:text-base font-display font-bold text-ink border-b-2 border-ink -mb-[1px] tracking-wide select-none"
        >
          Description
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-6 text-neutral-700 leading-relaxed text-xs md:text-sm">
        <p className="max-w-4xl text-neutral-700 leading-relaxed text-xs md:text-sm font-normal">
          {product.description}
        </p>
      </div>
    </section>
  );
}
