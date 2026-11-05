"use client";

import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useStore } from "@/components/store/StoreContext";

const noopSubscribe = () => () => {};

export function MobileNavigation() {
  const { cart, wishlist, setCartOpen } = useStore();
  const isMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const cartCount = isMounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const wishlistCount = isMounted ? wishlist.length : 0;

  return (<>
    <div aria-hidden="true" className="h-[calc(64px+env(safe-area-inset-bottom))] md:hidden" />
    <nav className="fixed inset-x-0 bottom-0 z-40 flex min-h-[calc(64px+env(safe-area-inset-bottom))] items-center justify-around bg-white px-1 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] text-ink shadow-[0_-1px_8px_#0001] md:hidden" aria-label="Mobile navigation">
      <Link
        href="/"
        className="flex min-h-11 min-w-12 flex-col items-center justify-center gap-1"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        <Icon name="home" size={20} />
        <span className="text-[10px]">Home</span>
      </Link>
      <Link href="/shop" className="flex min-h-11 min-w-12 flex-col items-center justify-center gap-1">
        <Icon name="grid" size={20} />
        <span className="text-[10px]">Shop</span>
      </Link>
      <Link href="/dashboard" className="flex min-h-11 min-w-12 flex-col items-center justify-center gap-1">
        <Icon name="user" size={20} />
        <span className="text-[10px]">Account</span>
      </Link>
      <Link href="/wishlist" className="relative flex min-h-11 min-w-12 flex-col items-center justify-center gap-1">
        <Icon name="heart" size={20} />
        {wishlistCount > 0 && (
          <span className="absolute -right-1 -top-1 size-3.5 rounded-md bg-[#d0473e] text-center font-display text-[9px] leading-3.5 text-white font-medium">
            {wishlistCount}
          </span>
        )}
        <span className="text-[10px]">Wishlist</span>
      </Link>
      <button
        className="relative flex min-h-11 min-w-12 flex-col items-center justify-center gap-1"
        onClick={() => {
          setCartOpen(true);
        }}
      >
        <Icon name="bag" size={20} />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 size-3.5 rounded-md bg-[#d0473e] text-center font-display text-[9px] leading-3.5 text-white font-medium">
            {cartCount}
          </span>
        )}
        <span className="text-[10px]">Cart</span>
      </button>
    </nav>
  </>);
}
