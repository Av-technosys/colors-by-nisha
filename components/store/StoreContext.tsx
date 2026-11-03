"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ProductItem } from "@/data/products";

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
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[]; // slugs
  addToCart: (product: ProductItem, size?: string, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  notification: string | null;
  clearNotification: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("cbn_cart");
      return saved ? JSON.parse(saved) : [];
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
  const [notification, setNotification] = useState<string | null>(null);

  // Save on change
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

  const addToCart = (product: ProductItem, size = "M", quantity = 1) => {
    if (!product.inStock) return;
    const limit = product.stockCount ?? Infinity;
    quantity = Math.min(limit, Math.max(1, Math.floor(quantity)));
    setCart((prev) => {
      const existing = prev.findIndex((item) => item.slug === product.slug && item.variantId === product.variantId && item.size === size);
      if (existing !== -1) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], price: product.price, stockCount: product.stockCount, quantity: Math.min(limit, copy[existing].quantity + quantity) };
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images[0],
          size,
          variantId: product.variantId,
          stockCount: product.stockCount,
          quantity,
        },
      ];
    });
    setNotification(`Added "${product.name}" to shopping bag!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: Math.min(copy[index].stockCount ?? Infinity, Math.max(1, Math.floor(quantity))) };
      return copy;
    });
  };

  const toggleWishlist = (slug: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(slug);
      const updated = exists ? prev.filter((s) => s !== slug) : [...prev, slug];
      setNotification(exists ? "Removed from wishlist" : "Added to wishlist");
      setTimeout(() => setNotification(null), 3000);
      return updated;
    });
  };

  const isWishlisted = (slug: string) => wishlist.includes(slug);

  const clearNotification = () => setNotification(null);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isWishlisted,
        cartOpen,
        setCartOpen,
        menuOpen,
        setMenuOpen,
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
