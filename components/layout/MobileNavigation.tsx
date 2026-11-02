"use client";

import { Icon } from "@/components/ui/Icon";

export function MobileNavigation({ onShop, onPanel }: { onShop: () => void; onPanel: (name: string) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around bg-white px-1 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))] text-ink shadow-[0_-1px_8px_#0001] md:hidden" aria-label="Mobile navigation">{[{ icon: "home", label: "Home" }, { icon: "grid", label: "Shop" }, { icon: "user", label: "Account" }, { icon: "heart", label: "Wishlist" }, { icon: "bag", label: "Cart" }].map(item => <button className="flex min-w-12 flex-col items-center gap-1" key={item.label} onClick={() => item.label === "Home" ? window.scrollTo({ top: 0, behavior: "smooth" }) : item.label === "Shop" ? onShop() : onPanel(item.label === "Cart" ? "Shopping bag" : item.label)}>
      <Icon name={item.icon} size={20} />
      <span className="text-[10px]">{item.label}</span>
    </button>)}</nav>

  );
}
