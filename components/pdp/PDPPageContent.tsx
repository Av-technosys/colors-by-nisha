"use client";

import { selectVariant } from "@/helpers/store/variant";
import React, { useState } from "react";
import Link from "next/link";
import { type ProductItem } from "@/data/products";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { useStore } from "@/components/store/StoreContext";
import { ProductGallery } from "./ProductGallery";
import { ProductDetailsInfo } from "./ProductDetailsInfo";
import { ProductTabs } from "./ProductTabs";
import { RelatedProductsSection } from "./RelatedProductsSection";
import { StickyBottomBar } from "./StickyBottomBar";
import { QuickViewModal } from "@/components/shop/QuickViewModal";

interface PDPPageContentProps {
  product: ProductItem;
  relatedProducts: ProductItem[];
}

export function PDPPageContent({ product: originalProduct, relatedProducts }: PDPPageContentProps) {
  const [variantId, setVariantId] = useState(originalProduct.variants?.find(variant => variant.stock !== 0)?.id || originalProduct.variants?.[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const product = selectVariant(originalProduct, variantId);
  const { setCartOpen, notification } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  return (
    <div className="min-h-screen bg-white text-ink flex flex-col pb-28 md:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-md bg-ink px-5 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification}
        </div>
      )}

      <main className="flex-1">
        {/* Breadcrumb: Home - Shop - PRODUCT NAME */}
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full pt-3 pb-2">
          <nav aria-label="Breadcrumbs" className="text-xs text-neutral-500">
            <ol className="flex items-center gap-2 flex-wrap font-medium">
              <li>
                <Link href="/" className="hover:text-ink transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-neutral-400">-</li>
              <li>
                <Link href="/shop" className="hover:text-ink transition-colors">
                  Shop
                </Link>
              </li>
              <li className="text-neutral-400">-</li>
              <li className="font-semibold text-ink uppercase tracking-wide">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>

        {/* 2-Column Main Section */}
        <section className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full pt-1 md:pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 lg:gap-14 items-start">
            {/* Left: Gallery - Normal block on mobile, sticky only on desktop! */}
            <div className="relative lg:sticky lg:top-28">
              <ProductGallery key={`${product.id}-${variantId}`}
                images={product.images}
                productName={product.name}
                productSlug={product.slug}
              />
            </div>

            {/* Right: Details & Purchase Form directly below image on mobile */}
            <div className="pt-3 md:pt-0">
              <ProductDetailsInfo product={product} variantId={variantId} onVariantChange={id => { setVariantId(id); setQuantity(1); }} quantity={quantity} onQuantityChange={setQuantity} />
            </div>
          </div>

          {/* Product Description Tabs */}
          <div className="mt-8 md:mt-16">
            <ProductTabs product={product} />
          </div>

          {/* Related Products */}
          <RelatedProductsSection
            products={relatedProducts}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        </section>
      </main>

      {/* Sticky Bottom Add to Cart Bar (Desktop & Mobile) with Dynamic Scroll Fill Button */}
      <StickyBottomBar product={product} quantity={quantity} onQuantityChange={setQuantity} onAdd={() => {
        const terms = document.getElementById("terms-check") as HTMLInputElement | null;
        if (!terms?.checked) document.getElementById("pdp-main-buy-actions")?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("pdp-add-to-cart")?.click();
      }} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation
        onPanel={(panel) => {
          if (panel === "Shopping bag" || panel === "Cart") setCartOpen(true);
        }}
      />

      {/* Quick View Modal */}
      <QuickViewModal key={quickViewProduct?.id || "closed"} product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
