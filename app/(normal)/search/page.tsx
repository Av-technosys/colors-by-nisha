"use client";

import { Form } from "@/components/ui/Form";


import { Skeleton } from "@/components/ui/Skeleton";
import { CollectionSkeleton } from "@/components/ui/PageSkeletons";

import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { money } from "@/data/home";
import { productsData, type ProductItem } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { IoCloseOutline, IoSearchOutline } from "react-icons/io5";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("search") || searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [allProducts, setAllProducts] = useState<ProductItem[]>(productsData);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    fetch("/api/search")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {}).finally(() => setLoadingProducts(false));
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? allProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.category.toLowerCase().includes(normalizedQuery) ||
          (product.collection &&
            product.collection.toLowerCase().includes(normalizedQuery)) ||
          (product.description &&
            product.description.toLowerCase().includes(normalizedQuery))
        );
      })
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      const input = e.currentTarget.querySelector("input");
      input?.setCustomValidity("Please enter a search term.");
      input?.reportValidity();
      return;
    }
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] py-10 md:py-14 relative min-h-[70vh] flex flex-col">
        {/* Title (Shown on Empty Search matching Image 1) */}
        <h1 className={`font-display text-3xl font-normal leading-tight tracking-normal md:text-4xl text-center text-[#111111] mb-6 md:mb-8 ${normalizedQuery ? "sr-only" : ""}`}>
          Search Our Site
        </h1>

        {/* Search Input Bar (Pill Shape matching Screenshot) */}
        <div className="w-full max-w-[620px] mx-auto mb-8 md:mb-12 pt-2">
          <Form onInput={event => (event.target as HTMLInputElement).setCustomValidity("")} onSubmit={handleSearchSubmit} className="relative flex items-center rounded-md border border-neutral-300 focus-within:border-black bg-white px-5 py-3 md:py-3.5 shadow-xs transition-colors">
            <input
              autoFocus
              aria-label="Search products"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I'm looking for..."
              className="w-full bg-transparent font-sans text-sm md:text-base outline-none pr-16 text-ink placeholder:text-neutral-500"
            />

            <div className="absolute right-4 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-neutral-400 hover:text-black transition cursor-pointer p-0.5"
                  aria-label="Clear search"
                >
                  <IoCloseOutline size={20} />
                </button>
              )}
              <button
                type="submit"
                className="text-neutral-500 hover:text-black transition cursor-pointer p-0.5"
                aria-label="Submit search"
              >
                <IoSearchOutline size={20} />
              </button>
            </div>
          </Form>
        </div>

        {/* Search Results Area (Matching Image 2) */}
        {normalizedQuery && (
          <div className="flex-1 w-full animate-in fade-in duration-200">
            {/* "Search for ..." subtitle on left */}
            <div className="mb-6">
              <p className="font-sans text-sm md:text-base text-neutral-700 font-normal">
                Search for &ldquo;{query}&rdquo;
              </p>
            </div>

            {loadingProducts ? <div role="status" aria-label="Loading search results" className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">{[0, 1, 2, 3, 4].map(item => <div key={item} className="space-y-3"><Skeleton className="aspect-[2/3] w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>)}</div> : results.length > 0 ? (
              <>
                {/* 5-Column Grid Matching Image 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                  {results.map((product) => (
                    <button
                      type="button"
                      key={product.id || product.slug}
                      className="group flex w-full appearance-none flex-col border-0 bg-transparent p-0 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a66c40]"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <span className="relative block aspect-2/3 w-full overflow-hidden rounded-md bg-neutral-100 shadow-xs">
                        <Image
                          src={
                            product.images[0] ||
                            "/product-placeholder.svg"
                          }
                          alt=""
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      </span>
                      <span className="mt-3 block font-display text-[14px] md:text-[15px] font-medium text-ink uppercase tracking-wide group-hover:text-purple transition-colors">
                        {product.name}
                      </span>
                      <span className="mt-1 block font-sans text-sm md:text-[15px] text-neutral-600">
                        {money(product.price)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Centered VIEW ALL RESULTS Button */}
                <div className="mt-10 mb-12 flex justify-center">
                  <Link
                    href={`/shop?search=${encodeURIComponent(query)}`}
                    className="inline-flex items-center justify-center bg-[#201a3c] hover:bg-[#d4af37] text-[#FCF1D8] hover:text-[#201a3c] font-display text-[14px] md:text-[15px] font-semibold uppercase tracking-[1.5px] px-8 py-3.5 rounded-md transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    VIEW ALL RESULTS
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="font-sans text-sm md:text-base text-neutral-500">
                  No products found matching &ldquo;{query}&rdquo;.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick View Modal if a product in search is clicked */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<CollectionSkeleton title="Search" filters={false} />}
    >
      <SearchPageContent />
    </Suspense>
  );
}

