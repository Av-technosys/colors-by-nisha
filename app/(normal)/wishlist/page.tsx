"use client";

import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { ProductCard } from "@/components/store/ProductCard";
import { useStore } from "@/components/store/StoreContext";
import { images, type Product } from "@/data/home";
import { productsData, type ProductItem } from "@/data/products";
import { allCatalogProducts, getProductByName, addRecentlyViewed, getRecentlyViewed } from "@/lib/store";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [allProducts, setAllProducts] = useState<ProductItem[]>(productsData);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const isMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
    fetch("/api/search")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Map wishlist strings to Product objects
  const seenWishlist = new Set<string>();
  const wishlistProducts = wishlist
    .map((identifier) => {
      // 1. Try finding in loaded products
      const lower = identifier.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      const foundInAll = allProducts.find((p) => {
        const pSlug = p.slug.toLowerCase().trim();
        const pNameLower = p.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
        return pSlug === lower || pNameLower === lower;
      });
      if (foundInAll) {
        return {
          name: foundInAll.name,
          price: foundInAll.price,
          image: 30, // fallback id
          slug: foundInAll.slug,
          productItem: foundInAll,
        } as Product & { slug: string; productItem: ProductItem };
      }

      // 2. Try catalog by name or slug
      const found = getProductByName(identifier);
      if (found) {
        return {
          ...found,
          slug: found.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        } as Product & { slug: string; productItem?: ProductItem };
      }
      return undefined;
    })
    .filter((p): p is Product & { slug: string; productItem?: ProductItem } => {
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

  const handleOpenProduct = (product: Product & { slug?: string; productItem?: ProductItem }) => {
    addRecentlyViewed(product.name);
    if (product.productItem) {
      setSelectedProduct(product.productItem);
      return;
    }
    const imgSrc = images[product.image] || "/product-placeholder.svg";
    const secondSrc = product.second ? images[product.second] : undefined;
    const imgs = [imgSrc, secondSrc].filter(Boolean) as string[];
    setSelectedProduct({
      id: String(product.name),
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: product.price,
      images: imgs.length ? imgs : ["/product-placeholder.svg"],
      category: "Couture",
      categorySlug: "couture",
      inStock: true,
      description: "Handcrafted designer heirloom created with royal heritage craftsmanship.",
      variants: [{ id: "v1", name: "Free Size", stock: 10, price: product.price, images: imgs }],
    });
  };

  return (
    <main className="min-h-screen bg-white py-10 md:py-14">
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full">
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
        <h1 className="font-display text-3xl font-normal leading-tight tracking-normal md:text-4xl text-center text-[#111111] mb-6 md:mb-8">
          Wishlist
        </h1>

        {/* 3. Wishlist Content Section */}
        {isMounted && wishlistProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {wishlistProducts.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  saved={wishlist}
                  toggleSave={() => toggleWishlist(product.slug || product.name)}
                  onSelect={() => handleOpenProduct(product)}
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
              href="/shop"
              className="inline-flex items-center justify-center bg-[#2d254d] text-[#FCF1D8] hover:bg-[#d4af37] hover:text-[#2d254d] font-display text-[16px] font-[500] uppercase tracking-[1.5px] leading-normal px-8 py-3.5 rounded-md transition-all duration-300 shadow-sm cursor-pointer"
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
            className="text-center font-display text-2xl font-medium leading-tight tracking-normal md:text-3xl text-[#111111] mb-6 md:mb-8"
          >
            Recently Viewed Products
          </h2>

          {isMounted && recentlyViewedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {recentlyViewedProducts.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  saved={wishlist}
                  toggleSave={() => toggleWishlist(product.name)}
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
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
