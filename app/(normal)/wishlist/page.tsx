"use client";

import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { ProductCard } from "@/components/store/ProductCard";
import type { Product } from "@/data/home";
import type { ProductItem } from "@/data/products";
import {
  addRecentlyViewed,
  getProductByName,
  useStoreState,
} from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function WishlistPage() {
  const { wishlist, recentlyViewed, toggleWishlist, mounted } = useStoreState();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Map product names to Product objects and deduplicate by canonical name
  const seenWishlist = new Set<string>();
  const wishlistProducts = wishlist
    .map((name) => getProductByName(name))
    .filter((p): p is Product => {
      if (!p) return false;
      const key = p.name.trim().toUpperCase();
      if (seenWishlist.has(key)) return false;
      seenWishlist.add(key);
      return true;
    });

  const seenRecent = new Set<string>();
  const recentlyViewedProducts = recentlyViewed
    .map((name) => getProductByName(name))
    .filter((p): p is Product => {
      if (!p) return false;
      const key = p.name.trim().toUpperCase();
      if (seenRecent.has(key)) return false;
      seenRecent.add(key);
      return true;
    });

  const handleOpenProduct = (product: Product) => {
    addRecentlyViewed(product.name);
    setSelectedProduct(product);
  };

  const toProductItem = (p: Product): ProductItem => ({
    id: String(p.name),
    name: p.name,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    price: p.price,
    images: [p.image, p.second].filter(Boolean).map(String),
    category: "Couture",
    categorySlug: "couture",
    inStock: true,
    description: "",
    variants: [{ id: "v1", name: "Free Size", stock: 10, price: p.price, images: [] }],
  });

  return (
    <main className="min-h-screen bg-white py-8 md:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-8">
        {/* 1. Breadcrumbs */}
        <nav
          className="text-center font-sans text-xs md:text-sm text-neutral-500 mb-2"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>{" "}
          <span className="text-neutral-300 mx-1">&bull;</span>{" "}
          <span className="text-neutral-800 font-medium">Wishlist</span>
        </nav>

        {/* 2. Main Title */}
        <h1 className="text-center font-display text-[32px] md:text-[38px] font-normal leading-[45px] text-[#111111] mb-6 md:mb-8">
          Wishlist
        </h1>

        {/* 3. Wishlist Content Section */}
        {mounted && wishlistProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {wishlistProducts.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  saved={wishlist}
                  toggleSave={toggleWishlist}
                  onSelect={handleOpenProduct}
                  variant="wishlist"
                  className="w-full"
                />
              ))}
            </div>
          </div>
        ) : (
          /* Empty State matching Reference Image */
          <div className="text-center pt-1 pb-4 md:pb-6">
            <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444] mb-6">
              No products were added to the wishlist page.
            </p>
            <Link
              href="/#currently-obsessed"
              className="inline-flex items-center justify-center bg-[#2d254d] text-[#FCF1D8] hover:bg-[#d4af37] hover:text-[#2d254d] font-display text-[16px] font-[500] uppercase tracking-[1.5px] leading-normal px-8 py-3.5 rounded-[4px] transition-all duration-300 shadow-sm cursor-pointer"
            >
              BACK TO SHOPPING
            </Link>
          </div>
        )}

        {/* 4. Section Divider */}
        <hr className="w-full border-neutral-200/60 my-6 md:my-8" />

        {/* 5. Recently Viewed Products Section */}
        <section aria-labelledby="recently-viewed-title">
          <h2
            id="recently-viewed-title"
            className="text-center font-display text-[26px] md:text-[32px] font-normal leading-[45px] text-[#111111] mb-6 md:mb-8"
          >
            Recently Viewed Products
          </h2>

          {mounted && recentlyViewedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {recentlyViewedProducts.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  saved={wishlist}
                  toggleSave={toggleWishlist}
                  onSelect={handleOpenProduct}
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400 font-sans text-sm">
              You haven&apos;t viewed any items yet. Explore our shop to see
              your recently viewed products here!
            </div>
          )}
        </section>
      </div>

      {/* Quick View Modal Matching Screenshots */}
      {selectedProduct && (
        <QuickViewModal
          product={toProductItem(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
