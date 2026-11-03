"use client";

import { Icon } from "@/components/ui/Icon";
import { images } from "@/data/home";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useStore } from "@/components/store/StoreContext";

const noopSubscribe = () => () => {};

export interface HeaderProps {
  savedCount?: number;
  cartCount?: number;
  onShop?: () => void;
  onPanel?: (name: string) => void;
  solid?: boolean;
  activeNav?: "home" | "shop" | "about" | "contact" | "blogs";
}

export function Header({
  savedCount,
  cartCount,
  onShop,
  onPanel,
  solid = false,
  activeNav,
}: HeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cart, wishlist, setMenuOpen, setCartOpen } = useStore();
  const isMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (solid) return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [solid]);

  const liveCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const liveWishlistCount = wishlist.length;

  // Auto-updating cart & wishlist counts from global StoreContext
  const displayCartCount = isMounted ? liveCartCount : (cartCount ?? 0);
  const displayWishlistCount = isMounted ? liveWishlistCount : (savedCount ?? 0);

  const isEffectiveSolid = solid || !isHome || scrolled;

  const handleMenuClick = () => {
    if (onPanel) onPanel("Menu");
    setMenuOpen(true);
  };

  const handlePanelClick = (name: string, panelName?: string) => {
    if (name === "Cart" || panelName === "Shopping bag") {
      setCartOpen(true);
    }
    onPanel?.(panelName || name);
  };

  const currentNav =
    activeNav ||
    (pathname === "/"
      ? "home"
      : pathname.startsWith("/shop")
      ? "shop"
      : pathname.startsWith("/about")
      ? "about"
      : pathname.startsWith("/contact")
      ? "contact"
      : pathname.startsWith("/blog")
      ? "blogs"
      : undefined);

  const headerClass =
    !isHome || solid
      ? "sticky top-0 z-30 grid h-[68px] md:h-[88px] lg:h-[100px] w-full grid-cols-[1fr_auto_1fr] items-center bg-white px-3 md:px-5 text-ink shadow-xs border-b border-neutral-100 lg:px-[max(24px,calc((100vw-1280px)/2))]"
      : `sticky top-0 z-30 grid h-[68px] md:h-[88px] lg:h-[100px] w-full grid-cols-[1fr_auto_1fr] items-center bg-white px-3 md:px-5 text-ink transition-[background-color,color,box-shadow] duration-500 ease-out motion-reduce:transition-none lg:fixed lg:px-[max(24px,calc((100vw-1280px)/2))] ${
          scrolled
            ? "lg:bg-white lg:text-ink lg:shadow-sm"
            : "lg:bg-white/0 lg:text-white lg:shadow-none"
        }`;

  return (
    <>
      <header className={headerClass}>
        <button
          className="col-start-1 row-start-1 justify-self-start p-2 lg:hidden text-ink cursor-pointer"
          aria-label="Open menu"
          onClick={handleMenuClick}
        >
          <Icon name="menu" size={22} />
        </button>
        <Link
          href="/"
          className="relative col-start-2 block h-[60px] md:h-[80px] lg:h-[90px] w-[56px] md:w-[72px] lg:col-start-auto"
          aria-label="Colors by Nisha home"
        >
          <Image
            src={images[2]}
            alt="Colors by Nisha Vijay"
            fill
            sizes="100px"
            priority
            className={`object-contain transition-opacity duration-500 ease-out motion-reduce:transition-none ${
              isEffectiveSolid ? "opacity-0" : "opacity-0 lg:opacity-100"
            }`}
          />
          <Image
            src={images[1]}
            alt=""
            fill
            sizes="100px"
            priority
            className={`object-contain transition-opacity duration-500 ease-out motion-reduce:transition-none ${
              isEffectiveSolid ? "opacity-100" : "opacity-100 lg:opacity-0"
            }`}
          />
        </Link>
        <nav
          className="hidden items-center gap-8 font-display text-[15px] tracking-wide lg:flex"
          aria-label="Main navigation"
        >
          <Link
            className={`py-3 hover:underline underline-offset-8 transition-colors ${
              currentNav === "home" ? "font-semibold underline" : ""
            }`}
            href="/"
          >
            Home
          </Link>
          <Link
            className={`py-3 hover:underline underline-offset-8 transition-colors ${
              currentNav === "shop" ? "font-semibold underline" : ""
            }`}
            href="/shop"
          >
            Shop
          </Link>
          <Link
            className={`py-3 hover:underline underline-offset-8 transition-colors ${
              currentNav === "about" ? "font-semibold underline" : ""
            }`}
            href="/about"
          >
            About us
          </Link>
          <Link
            className={`py-3 hover:underline underline-offset-8 transition-colors ${
              currentNav === "contact" ? "font-semibold underline" : ""
            }`}
            href="/contact"
          >
            Contact
          </Link>
          <Link
            className={`py-3 hover:underline underline-offset-8 transition-colors ${
              currentNav === "blogs" ? "font-semibold underline" : ""
            }`}
            href="/blog"
          >
            Blogs
          </Link>
        </nav>
        <div className="col-start-3 row-start-1 flex items-center justify-end gap-1 md:gap-2 lg:gap-4">
          {[
            { name: "Search", icon: "search", mobile: true },
            { name: "Account", icon: "user", mobile: false, href: "/dashboard" },
            {
              name: "Wishlist",
              icon: "heart",
              mobile: true,
              href: "/wishlist",
              count: displayWishlistCount,
            },
            {
              name: "Cart",
              panel: "Shopping bag",
              icon: "cart",
              mobile: true,
              count: displayCartCount,
            },
          ].map((item) =>
            item.href ? (
              <Link
                key={item.name}
                href={item.href}
                className={`relative min-h-9 min-w-8 items-center justify-center cursor-pointer ${
                  item.mobile ? "inline-flex" : "hidden lg:inline-flex"
                }`}
                aria-label={item.name}
              >
                <Icon name={item.icon} size={21} />
                {typeof item.count === "number" && item.count > 0 && (
                  <span className="absolute -right-1 -top-px size-4 rounded-full bg-[#d0473e] text-center font-display text-[10px] leading-4 text-white font-medium">
                    {item.count}
                  </span>
                )}
              </Link>
            ) : (
              <button
                key={item.name}
                className={`relative min-h-9 min-w-8 items-center justify-center cursor-pointer ${
                  item.mobile ? "inline-flex" : "hidden lg:inline-flex"
                }`}
                aria-label={item.name}
                onClick={() => handlePanelClick(item.name, item.panel)}
              >
                <Icon name={item.icon} size={21} />
                {item.name === "Cart" && displayCartCount > 0 && (
                  <span className="absolute -right-1 -top-px size-4 rounded-full bg-[#d0473e] text-center font-display text-[10px] leading-4 text-white font-medium">
                    {displayCartCount}
                  </span>
                )}
                {item.name === "Wishlist" && displayWishlistCount > 0 && (
                  <span className="absolute -right-1 -top-px size-4 rounded-full bg-[#d0473e] text-center font-display text-[10px] leading-4 text-white font-medium">
                    {displayWishlistCount}
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </header>
      {scrolled && (
        <button
          className="fixed bottom-[85px] right-4 z-20 size-10 rounded-full bg-white text-xl shadow-md transition-transform hover:-translate-y-1 md:bottom-8 md:right-8 md:size-12 md:text-2xl cursor-pointer"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}
    </>
  );
}
