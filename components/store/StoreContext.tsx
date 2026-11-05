"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ProductItem } from "@/data/products";
import { cartStorage, wishlistStorage } from "@/helpers/store/browser-storage";
import { selectVariant } from "@/helpers/store/variant";
import { findProductOption } from "@/helpers/store/product-option";
import { isUuid } from "@/helpers/orders/input";

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
  cartReady: boolean;
  wishlist: string[]; // slugs
  addToCart: (product: ProductItem, size?: string, quantity?: number) => boolean;
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

const subscribeReady = () => () => {};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const cart = useSyncExternalStore(cartStorage.subscribe, cartStorage.getSnapshot, cartStorage.getServerSnapshot);
  const wishlist = useSyncExternalStore(wishlistStorage.subscribe, wishlistStorage.getSnapshot, wishlistStorage.getServerSnapshot);
  const cartReady = useSyncExternalStore(subscribeReady, () => true, () => false);
  const setCart = cartStorage.update;
  const setWishlist = wishlistStorage.update;

  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (notificationTimer.current) clearTimeout(notificationTimer.current); }, []);

  const clearNotification = useCallback(() => {
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    setNotification(null);
  }, []);

  function notify(message: string) {
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    setNotification(message);
    notificationTimer.current = setTimeout(() => setNotification(null), 3000);
  }

  const syncCart = useCallback((products: ProductItem[]) => {
    const catalog = new Map(products.map(product => [product.slug, product]));
    setCart(current => current.map(item => {
      const named = products.filter(product => product.name.trim().toLowerCase() === item.name?.trim().toLowerCase());
      const product = catalog.get(item.slug) ?? (named.length === 1 ? named[0] : undefined);
      if (!product) return { ...item, available: false };

      const matched = findProductOption(product.variants ?? [], product.price, item.size, item.variantId);
      const variantId = matched?.id;

      if ((product.variants?.length && !variantId) || (item.variantId && item.variantId !== "v1" && !matched)) return { ...item, available: false };
      const selected = variantId ? selectVariant(product, variantId) : product;
      const isAvailable = product.inStock !== false && (selected.inStock !== false);
      return {
        ...item,
        slug: product.slug,
        variantId,
        size: matched && (!item.size || ["Standard", "Free Size"].includes(item.size) || item.variantId === "v1") ? matched.name : item.size,
        name: selected.name,
        price: selected.price,
        image: selected.images[0] || item.image || "/product-placeholder.svg",
        stockCount: selected.stockCount,
        available: isAvailable,
      };
    }));
  }, [setCart]);

  const completeOrder = useCallback((purchased: CartItem[]) => {
    setCart(current => current.flatMap(item => {
      const ordered = purchased.find(line => line.slug === item.slug && (line.variantId || "") === (item.variantId || "") && line.size === item.size);
      if (!ordered) return [item];
      const quantity = item.quantity - ordered.quantity;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
    setCartOpen(false);
  }, [setCart]);

  const addToCart = (product: ProductItem, size = "Standard", quantity = 1) => {
    if (!isUuid(product.id) || !product.inStock || !Number.isFinite(quantity) || quantity < 1) return false;
    const option = findProductOption(product.variants ?? [], product.price, size, product.variantId);
    if ((product.variants?.length || product.variantId) && (!option || !isUuid(option.id))) return false;
    const selected = option ? selectVariant(product, option.id) : product;
    if (!selected.inStock) return false;
    const limit = Math.min(99, selected.stockCount ?? 99);
    const qty = Math.min(limit, Math.floor(quantity));
    const selectedSize = option && ["Standard", "Free Size"].includes(size) ? option.name : size;
    const previous = cartStorage.getSnapshot();
    const existing = previous.findIndex(item => item.slug === product.slug && (item.variantId || "") === (option?.id || "") && item.size === selectedSize);
    if (existing !== -1 && previous[existing].quantity >= limit) return false;
    setCart(current => {
      const entry = { id: `${product.slug}-${selectedSize}-${option?.id || "default"}`, slug: product.slug, name: selected.name, price: selected.price, image: selected.images[0] || "/product-placeholder.svg", size: selectedSize, variantId: option?.id, stockCount: selected.stockCount, quantity: qty, available: true };
      if (existing === -1) return [...current, entry];
      return current.map((item, index) => index === existing ? { ...entry, quantity: Math.min(limit, item.quantity + qty) } : item);
    });
    notify(`Added "${selected.name}" to cart`);
    setCartOpen(true);
    return true;
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
        copy[index] = { ...copy[index], quantity: limit === 0 ? Math.max(1, Math.min(99, Math.floor(quantity))) : Math.max(1, Math.min(99, limit, Math.floor(quantity))) };
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


  return (
    <StoreContext.Provider
      value={{
        cart,
        cartReady,
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
