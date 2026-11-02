"use client";

import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export function MobileNavigation({ onPanel }: { onShop?: () => void; onPanel?: (name: string) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around bg-white px-1 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))] text-ink shadow-[0_-1px_8px_#0001] md:hidden" aria-label="Mobile navigation">
      <Link href="/" className="flex min-w-12 flex-col items-center gap-1">
        <Icon name="home" size={20} />
        <span className="text-[10px]">Home</span>
      </Link>
      <Link href="/shop" className="flex min-w-12 flex-col items-center gap-1">
        <Icon name="grid" size={20} />
        <span className="text-[10px]">Shop</span>
      </Link>
      <button className="flex min-w-12 flex-col items-center gap-1" onClick={() => onPanel?.("Account")}>
        <Icon name="user" size={20} />
        <span className="text-[10px]">Account</span>
      </button>
      <button className="flex min-w-12 flex-col items-center gap-1" onClick={() => onPanel?.("Wishlist")}>
        <Icon name="heart" size={20} />
        <span className="text-[10px]">Wishlist</span>
      </button>
      <button className="flex min-w-12 flex-col items-center gap-1" onClick={() => onPanel?.("Shopping bag")}>
        <Icon name="bag" size={20} />
        <span className="text-[10px]">Cart</span>
      </button>
    </nav>
  );
}
