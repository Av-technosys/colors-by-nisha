"use client";

import React, { useState, useMemo } from "react";
import { formatINR, type ProductItem } from "@/data/products";
import { ShopProductCard } from "./ShopProductCard";
import { QuickViewModal } from "./QuickViewModal";

interface ShopPageContentProps {
  initialCategory?: string;
  initialSearch?: string;
  products: ProductItem[];
}

export function ShopPageContent({ initialCategory, initialSearch, products: allProducts }: ShopPageContentProps) {
  const maxPrice = Math.max(1, ...allProducts.map(product => product.price));
  const categoryOptions = [{ key: "all", label: "All Products", count: allProducts.length },
    ...Array.from(new Map(allProducts.filter(product => product.categorySlug).map(product => [product.categorySlug!, product.category])).entries()).map(([key, label]) => ({ key, label, count: allProducts.filter(product => product.categorySlug === key).length }))];

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || "");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [tempPriceMax, setTempPriceMax] = useState<number>(maxPrice);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [columnCount, setColumnCount] = useState<2 | 3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Accordion toggle states in sidebar
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    availability: true,
    price: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Counts calculation
  const counts = useMemo(() => {
    return {
      all: allProducts.length,
      inStock: allProducts.filter((p) => p.inStock).length,
      outOfStock: allProducts.filter((p) => !p.inStock).length,
    };
  }, [allProducts]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.collection && p.collection.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q));
          if (!match) return false;
        }
        // Category
        if (selectedCategory !== "all" && p.categorySlug !== selectedCategory && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        // Availability
        if (inStockOnly && !p.inStock) {
          return false;
        }
        // Price
        if (p.price < priceRange[0] || p.price > priceRange[1]) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title-ascending") return a.name.localeCompare(b.name);
        if (sortBy === "title-descending") return b.name.localeCompare(a.name);
        if (sortBy === "price-ascending") return a.price - b.price;
        if (sortBy === "price-descending") return b.price - a.price;
        if (sortBy === "created-descending") return (b.createdAt || "").localeCompare(a.createdAt || "");
        return 0; // featured default
      });
  }, [allProducts, searchQuery, selectedCategory, inStockOnly, priceRange, sortBy]);

  // Total pages
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Active filters count
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "all" ||
    inStockOnly ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setInStockOnly(false);
    setPriceRange([0, maxPrice]);
    setTempPriceMax(maxPrice);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="bg-white text-ink pb-20">
      {/* Page Heading - Normal white bg with only Products */}
      <div className="bg-white pt-8 pb-3 md:pt-12 md:pb-5 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-normal tracking-wide text-ink">
          Products
        </h1>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-[1360px] px-4 md:px-6 lg:px-8 pt-8">
        <div className="flex gap-8 lg:gap-12">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-28 space-y-6 divide-y divide-neutral-200">
              {/* Category Filter */}
              <div className="pt-2">
                <button
                  onClick={() => toggleSection("category")}
                  className="flex w-full items-center justify-between py-2 text-left font-display text-sm font-semibold uppercase tracking-wider text-ink"
                >
                  <span>Products Category</span>
                  <span className="text-base text-neutral-500">{openSections.category ? "−" : "+"}</span>
                </button>
                {openSections.category && (
                  <ul className="mt-3 space-y-2 text-sm">
                    {categoryOptions.map((cat) => (
                      <li key={cat.key}>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat.key);
                            setCurrentPage(1);
                          }}
                          className={`flex w-full items-center justify-between rounded px-2 py-1.5 transition-colors ${
                            selectedCategory === cat.key
                              ? "font-semibold text-ink bg-neutral-100"
                              : "text-neutral-600 hover:text-ink hover:bg-neutral-50"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className="text-xs text-neutral-400">({cat.count})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Availability Filter */}
              <div className="pt-5">
                <button
                  onClick={() => toggleSection("availability")}
                  className="flex w-full items-center justify-between py-2 text-left font-display text-sm font-semibold uppercase tracking-wider text-ink"
                >
                  <span>Availability</span>
                  <span className="text-base text-neutral-500">{openSections.availability ? "−" : "+"}</span>
                </button>
                {openSections.availability && (
                  <div className="mt-3 space-y-2 text-sm">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => {
                          setInStockOnly(e.target.checked);
                          setCurrentPage(1);
                        }}
                        className="size-4 rounded border-neutral-300 text-ink accent-ink focus:ring-0"
                      />
                      <span className="text-neutral-700">In stock ({counts.inStock})</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="pt-5">
                <button
                  onClick={() => toggleSection("price")}
                  className="flex w-full items-center justify-between py-2 text-left font-display text-sm font-semibold uppercase tracking-wider text-ink"
                >
                  <span>Price</span>
                  <span className="text-base text-neutral-500">{openSections.price ? "−" : "+"}</span>
                </button>
                {openSections.price && (
                  <div className="mt-3 space-y-4">
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>{formatINR(priceRange[0])}</span>
                      <span>{formatINR(tempPriceMax)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={1}
                      value={tempPriceMax}
                      onChange={(e) => setTempPriceMax(Number(e.target.value))}
                      className="w-full accent-ink cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPriceRange([0, tempPriceMax]);
                          setCurrentPage(1);
                        }}
                        className="flex-1 rounded bg-ink py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition"
                      >
                        Apply Price
                      </button>
                      {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                        <button
                          onClick={() => {
                            setPriceRange([0, maxPrice]);
                            setTempPriceMax(maxPrice);
                            setCurrentPage(1);
                          }}
                          className="rounded border border-neutral-300 px-3 text-xs text-neutral-600 hover:text-ink"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear all action */}
              {hasActiveFilters && (
                <div className="pt-5">
                  <button
                    onClick={resetFilters}
                    className="w-full rounded border border-neutral-300 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Product Listing Main Area */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4 mb-6">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink lg:hidden"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M6 12h12M8 18h8" strokeLinecap="round" />
                </svg>
                <span>Filter</span>
                {hasActiveFilters && (
                  <span className="size-2 rounded-full bg-[#d0473e]" />
                )}
              </button>

              {/* Product count */}
              <div className="text-xs md:text-sm text-neutral-500">
                Showing <span className="font-semibold text-ink">{filteredProducts.length}</span> products
              </div>

              {/* Right side: Layout Switcher & Sort By */}
              <div className="flex items-center gap-4 ml-auto">
                {/* Column Switcher (desktop) */}
                <div className="hidden sm:flex items-center gap-1 border border-neutral-200 rounded p-0.5">
                  {[2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setColumnCount(cols as 2 | 3 | 4)}
                      className={`grid size-7 place-items-center rounded text-xs font-semibold transition ${
                        columnCount === cols ? "bg-ink text-white" : "text-neutral-500 hover:text-ink"
                      }`}
                      aria-label={`${cols} columns`}
                      title={`${cols} columns`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>

                {/* Sorter Dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="shop-sort" className="hidden sm:inline text-xs font-medium text-neutral-600 whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    id="shop-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-ink focus:border-ink focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="title-ascending">Alphabetically, A-Z</option>
                    <option value="title-descending">Alphabetically, Z-A</option>
                    <option value="price-ascending">Price, low to high</option>
                    <option value="price-descending">Price, high to low</option>
                    <option value="created-descending">Date, new to old</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Pill Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pb-5">
                <span className="text-xs font-medium text-neutral-400">Active filters:</span>
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-ink">
                    Search: &ldquo;{searchQuery}&rdquo;
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="hover:text-red-600"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-ink">
                    Category: <span className="capitalize">{selectedCategory}</span>
                    <button onClick={() => setSelectedCategory("all")} className="hover:text-red-600">
                      ✕
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-ink">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)} className="hover:text-red-600">
                      ✕
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-ink">
                    Price: Up to {formatINR(priceRange[1])}
                    <button
                      onClick={() => {
                        setPriceRange([0, maxPrice]);
                        setTempPriceMax(maxPrice);
                      }}
                      className="hover:text-red-600"
                    >
                      ✕
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#a66c40] underline hover:text-ink ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            {paginatedProducts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-xl text-neutral-700">No products match your current filters.</p>
                <p className="mt-1 text-sm text-neutral-500">Try adjusting your filters or search terms.</p>
                <button
                  onClick={resetFilters}
                  className="mt-5 rounded bg-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 ${
                  columnCount === 2
                    ? "grid-cols-2"
                    : columnCount === 3
                    ? "grid-cols-2 md:grid-cols-3"
                    : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {paginatedProducts.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="grid size-10 place-items-center rounded-full border border-neutral-300 text-sm font-medium transition hover:border-ink disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`grid size-10 place-items-center rounded-full text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-ink text-white shadow-xs"
                        : "border border-neutral-200 text-neutral-700 hover:border-ink hover:text-ink"
                    }`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="grid size-10 place-items-center rounded-full border border-neutral-300 text-sm font-medium transition hover:border-ink disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Next page"
                >
                  ›
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-xs transition-opacity"
          style={{ overscrollBehavior: "contain" }}
          onClick={() => setMobileFilterOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div
            className="flex h-full w-[85%] max-w-[340px] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-250"
            style={{ overscrollBehavior: "contain" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="font-display text-base font-semibold uppercase tracking-wider text-ink">Filters</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="grid size-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{ overscrollBehavior: "contain" }}>
              {/* Category */}
              <div>
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Products Category
                </h3>
                <div className="space-y-1.5">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => { setSelectedCategory(cat.key); setCurrentPage(1); }}
                      className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm ${
                        selectedCategory === cat.key ? "bg-neutral-100 font-semibold text-ink" : "text-neutral-600"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-xs text-neutral-400">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="border-t border-neutral-100 pt-5">
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Availability
                </h3>
                <label className="flex items-center gap-3 text-sm text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                    className="size-4 rounded border-neutral-300 text-ink accent-ink"
                  />
                  <span>In stock ({counts.inStock})</span>
                </label>
              </div>

              {/* Price */}
              <div className="border-t border-neutral-100 pt-5">
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Max Price: {formatINR(tempPriceMax)}
                </h3>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={1}
                  value={tempPriceMax}
                  onChange={(e) => setTempPriceMax(Number(e.target.value))}
                  className="w-full accent-ink"
                />
              </div>
            </div>

            <div className="border-t border-neutral-200 p-4 space-y-2 bg-neutral-50">
              <button
                onClick={() => {
                  setPriceRange([0, tempPriceMax]);
                  setCurrentPage(1);
                  setMobileFilterOpen(false);
                }}
                className="w-full rounded bg-ink py-3 text-xs font-semibold uppercase tracking-wider text-white"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    resetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full rounded border border-neutral-300 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-700"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal key={quickViewProduct?.id || "closed"} product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}

