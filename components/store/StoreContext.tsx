"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ProductItem } from "@/data/products";
import { selectVariant } from "@/helpers/store/variant";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  variantId?: string;
  stockCount?: number;
  quantity: number;
  available?: boolean;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[]; // slugs
  addToCart: (product: ProductItem, size?: string, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  syncCart: (products: ProductItem[]) => void;
  completeOrder: (items: CartItem[]) => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  notification: string | null;
  clearNotification: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("cbn_cart");
      const items: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(items) ? items.filter((item): item is CartItem => Boolean(item && typeof item.slug === "string" && typeof item.size === "string" && typeof item.price === "number" && Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0)).slice(0, 50) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("cbn_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const syncCart = useCallback((products: ProductItem[]) => {
    const catalog = new Map(products.map(product => [product.slug, product]));
    setCart(current => current.map(item => {
      const product = catalog.get(item.slug);
      if (!product || (product.variants?.length && !item.variantId) || (item.variantId && !product.variants?.some(variant => variant.id === item.variantId))) return { ...item, available: false };
      const selected = item.variantId ? selectVariant(product, item.variantId) : product;
      return { ...item, name: selected.name, price: selected.price, image: selected.images[0] || "/product-placeholder.svg", stockCount: selected.stockCount, available: selected.inStock };
    }));
  }, []);

  const completeOrder = useCallback((purchased: CartItem[]) => {
    setCart(current => current.flatMap(item => {
      const ordered = purchased.find(line => line.slug === item.slug && (line.variantId || "") === (item.variantId || "") && line.size === item.size);
      if (!ordered) return [item];
      const quantity = item.quantity - ordered.quantity;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
    setCartOpen(false);
  }, []);

  // Save to localStorage whenever cart or wishlist updates
  useEffect(() => {
    try {
      localStorage.setItem("cbn_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("cbn_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const addToCart = (product: ProductItem, size = "Standard", quantity = 1) => {
    if (!product.inStock || !Number.isFinite(quantity) || quantity < 1) return;
    const limit = product.stockCount ?? Infinity;
    const qty = Math.min(limit, Math.max(1, Math.floor(quantity)));
    const finalPrice = typeof product.price === "number" ? product.price : Number(product.price) || 0;
    const finalImage = product.images?.[0] || "/Home/images/015_kesari_rang__IMG_0124.jpg";

    setCart((prev) => {
      const existing = prev.findIndex(
        (item) => item.slug === product.slug && (item.variantId || "") === (product.variantId || "") && item.size === size
      );
      if (existing !== -1) {
        const copy = [...prev];
        const nextQty = Math.min(limit, copy[existing].quantity + qty);
        copy[existing] = { ...copy[existing], quantity: nextQty, available: true, price: finalPrice, image: finalImage, stockCount: product.stockCount };
        return copy;
      }
      return [
        ...prev,
        {
          id: `${product.slug}-${size}-${product.variantId || "default"}`,
          slug: product.slug,
          name: product.name,
          price: finalPrice,
          image: finalImage,
          size,
          variantId: product.variantId,
          stockCount: product.stockCount,
          quantity: qty,
        },
      ];
    });

    setNotification(`Added "${product.name}" to cart`);
    setCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        const limit = copy[index].stockCount ?? Infinity;
        copy[index] = { ...copy[index], quantity: Math.min(limit, Math.floor(quantity)) };
      }
      return copy;
    });
  };

  const toggleWishlist = (slugOrName: string) => {
    if (!slugOrName) return;
    const lower = slugOrName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    setWishlist((prev) => {
      const matchIndex = prev.findIndex((item) => {
        const itemLower = item.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
        return itemLower === lower || item === slugOrName;
      });
      if (matchIndex >= 0) {
        return prev.filter((_, idx) => idx !== matchIndex);
      }
      return [...prev, slugOrName];
    });
  };

  const isWishlisted = (slugOrName: string) => {
    if (!slugOrName) return false;
    const lower = slugOrName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    return wishlist.some((item) => {
      const itemLower = item.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      return itemLower === lower || item === slugOrName;
    });
  };

  const clearNotification = () => setNotification(null);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        syncCart,
        completeOrder,
        toggleWishlist,
        isWishlisted,
        cartOpen,
        setCartOpen,
        menuOpen,
        setMenuOpen,
        searchOpen,
        setSearchOpen,
        notification,
        clearNotification,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
