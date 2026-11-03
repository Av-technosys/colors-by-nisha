"use client";

import { handpicked, masterpieces, products, type Product } from "@/data/home";
import { productsData } from "@/data/products";
import { useEffect, useState } from "react";

export const allCatalogProducts: Product[] = [
  ...products,
  ...masterpieces,
  ...handpicked.map((item) => ({
    name: item.name,
    price: item.price,
    image: item.image,
  })),
  ...productsData.map((item) => ({
    name: item.name,
    price: item.price,
    image: 30, // fallback image id
  })),
];

export function getProductByName(nameOrSlug: string): Product | undefined {
  if (!nameOrSlug) return undefined;
  const raw = nameOrSlug.trim();
  const normalized = raw.toUpperCase();
  const slugified = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // First check data/home products
  const fromHome = allCatalogProducts.find((p) => {
    const pName = p.name.trim().toUpperCase();
    const pSlug = p.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return pName === normalized || pSlug === slugified;
  });
  if (fromHome) return fromHome;

  // Then check data/products
  const fromProducts = productsData.find((p) => {
    const pName = p.name.trim().toUpperCase();
    const pSlug = p.slug.trim().toLowerCase();
    return pName === normalized || pSlug === slugified;
  });
  if (fromProducts) {
    return {
      name: fromProducts.name,
      price: fromProducts.price,
      image: 30,
    };
  }

  return undefined;
}

const WISHLIST_KEY = "cbn_wishlist";
const RECENTLY_VIEWED_KEY = "cbn_recently_viewed";
export const UPDATE_EVENT = "cbn_store_update";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed: string[] = raw ? JSON.parse(raw) : [];

    // Deduplicate by canonical product name
    const seen = new Set<string>();
    const deduplicated: string[] = [];

    for (const item of parsed) {
      if (!item) continue;
      const prod = getProductByName(item);
      const canonical = prod ? prod.name.trim().toUpperCase() : item.trim().toUpperCase();
      if (!seen.has(canonical)) {
        seen.add(canonical);
        deduplicated.push(prod ? prod.name : item);
      }
    }

    return deduplicated;
  } catch {
    return [];
  }
}

export function isItemInWishlist(nameOrSlug: string, list?: string[]): boolean {
  if (!nameOrSlug) return false;
  const currentList = list || getWishlist();
  const raw = nameOrSlug.trim();
  const normalized = raw.toUpperCase();
  const slugified = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return currentList.some((item) => {
    const itemNorm = item.trim().toUpperCase();
    const itemSlug = item.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return itemNorm === normalized || itemSlug === slugified;
  });
}

export function toggleWishlist(nameOrSlug: string): string[] {
  if (typeof window === "undefined" || !nameOrSlug) return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const current: string[] = raw ? JSON.parse(raw) : [];

    const targetRaw = nameOrSlug.trim();
    const targetNorm = targetRaw.toUpperCase();
    const targetSlug = targetRaw.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const prod = getProductByName(nameOrSlug);
    const prodNorm = prod ? prod.name.trim().toUpperCase() : targetNorm;
    const prodSlug = prod
      ? prod.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : targetSlug;

    // Check if item exists in current list
    const isAlreadySaved = current.some((item) => {
      const itemNorm = item.trim().toUpperCase();
      const itemSlug = item.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return (
        itemNorm === targetNorm ||
        itemSlug === targetSlug ||
        itemNorm === prodNorm ||
        itemSlug === prodSlug
      );
    });

    let updated: string[];
    if (isAlreadySaved) {
      // Remove ALL matching entries (both slugs, names, uppercase, lowercase)
      updated = current.filter((item) => {
        const itemNorm = item.trim().toUpperCase();
        const itemSlug = item.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          itemNorm !== targetNorm &&
          itemSlug !== targetSlug &&
          itemNorm !== prodNorm &&
          itemSlug !== prodSlug
        );
      });
    } else {
      // Add canonical product name
      const canonicalName = prod ? prod.name : nameOrSlug;
      updated = [...current, canonicalName];
    }

    // Cleanse & Deduplicate
    const seen = new Set<string>();
    const finalCleanList: string[] = [];
    for (const item of updated) {
      const p = getProductByName(item);
      const key = p ? p.name.trim().toUpperCase() : item.trim().toUpperCase();
      if (!seen.has(key)) {
        seen.add(key);
        finalCleanList.push(p ? p.name : item);
      }
    }

    localStorage.setItem(WISHLIST_KEY, JSON.stringify(finalCleanList));
    window.dispatchEvent(new Event(UPDATE_EVENT));
    window.dispatchEvent(new Event("storage"));
    return finalCleanList;
  } catch {
    return [];
  }
}

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed: string[] = raw ? JSON.parse(raw) : [];

    // Deduplicate
    const seen = new Set<string>();
    const deduplicated: string[] = [];
    for (const item of parsed) {
      if (!item) continue;
      const prod = getProductByName(item);
      const key = prod ? prod.name.trim().toUpperCase() : item.trim().toUpperCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(prod ? prod.name : item);
      }
    }
    return deduplicated;
  } catch {
    return [];
  }
}

export function addRecentlyViewed(name: string): string[] {
  if (typeof window === "undefined" || !name) return [];
  try {
    const current = getRecentlyViewed();
    const prod = getProductByName(name);
    const canonical = prod ? prod.name : name;

    const filtered = current.filter((item) => {
      const itemProd = getProductByName(item);
      const itemKey = itemProd ? itemProd.name.toUpperCase() : item.toUpperCase();
      const targetKey = canonical.toUpperCase();
      return itemKey !== targetKey;
    });

    const updated = [canonical, ...filtered].slice(0, 12);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(UPDATE_EVENT));
    window.dispatchEvent(new Event("storage"));
    return updated;
  } catch {
    return [];
  }
}

export function useStoreState() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWishlist(getWishlist());
    setRecentlyViewed(getRecentlyViewed());

    const handleUpdate = () => {
      setWishlist(getWishlist());
      setRecentlyViewed(getRecentlyViewed());
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    wishlist: mounted ? wishlist : [],
    recentlyViewed: mounted ? recentlyViewed : [],
    toggleWishlist,
    addRecentlyViewed,
    mounted,
  };
}
