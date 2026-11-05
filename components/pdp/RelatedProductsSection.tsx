"use client";

import type { ProductItem } from "@/data/products";
import { ShopProductCard } from "@/components/shop/ShopProductCard";

export function RelatedProductsSection({ products, onQuickView }: {
  products: ProductItem[];
  onQuickView?: (product: ProductItem) => void;
}) {
  if (!products.length) return null;
  return <section className="py-10 md:py-14 border-t border-neutral-200">
    <h2 className="mb-8 text-center font-display text-2xl font-medium leading-tight tracking-normal md:text-3xl text-ink">You May Also Like</h2>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
      {products.map(product => <ShopProductCard key={product.id} product={product} onQuickView={onQuickView} />)}
    </div>
  </section>;
}
