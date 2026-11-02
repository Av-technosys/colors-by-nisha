"use client";

import { Icon } from "@/components/ui/Icon";
import { images } from "@/data/home";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
  savedCount?: number;
  cartCount?: number;
  onShop?: () => void;
  onPanel?: (name: string) => void;
}

export function Header({
  savedCount = 0,
  cartCount = 0,
  onShop,
  onPanel,
}: HeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isSolid = !isHome || scrolled;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleShop = () => {
    if (onShop) {
      onShop();
    } else {
      window.location.href = "/#currently-obsessed";
    }
  };

  const headerClass = isHome
    ? `sticky top-0 z-30 grid h-[100px] w-full grid-cols-[1fr_auto_1fr] items-center bg-white px-4 text-ink transition-[background-color,color,box-shadow] duration-500 ease-out motion-reduce:transition-none md:px-5 lg:fixed lg:px-[max(24px,calc((100vw-1280px)/2))] ${
        scrolled
          ? "lg:bg-white lg:text-ink lg:shadow-sm"
          : "lg:bg-white/0 lg:text-white lg:shadow-none"
      }`
    : "sticky top-0 z-30 grid h-[100px] w-full grid-cols-[1fr_auto_1fr] items-center bg-white px-4 text-ink shadow-sm md:px-5 lg:px-[max(24px,calc((100vw-1280px)/2))]";

  return (
    <>
      <header className={headerClass}>
        <button
          className="col-start-1 row-start-1 justify-self-start p-2 lg:hidden"
          aria-label="Open menu"
          onClick={() => onPanel?.("Menu")}
        >
          <Icon name="menu" />
        </button>
        <Link
          href="/"
          className="relative col-start-2 block h-[90px] w-[72px] lg:col-start-auto"
          aria-label="Colors by Nisha home"
        >
          <Image
            src={images[2]}
            alt="Colors by Nisha Vijay"
            fill
            sizes="100px"
            priority
            className={`object-contain transition-opacity duration-500 ease-out motion-reduce:transition-none ${
              isSolid ? "opacity-0" : "opacity-0 lg:opacity-100"
            }`}
          />
          <Image
            src={images[1]}
            alt=""
            fill
            sizes="100px"
            priority
            className={`object-contain transition-opacity duration-500 ease-out motion-reduce:transition-none ${
              isSolid ? "opacity-100" : "opacity-100 lg:opacity-0"
            }`}
          />
        </Link>
        <nav
          className="hidden items-center gap-8 font-display text-base lg:flex"
          aria-label="Main navigation"
        >
          <Link className="py-3 hover:underline underline-offset-8" href="/">
            Home
          </Link>
          <button
            className="py-3 hover:underline underline-offset-8"
            onClick={handleShop}
          >
            Shop
          </button>
          <Link
            className="py-3 hover:underline underline-offset-8"
            href="/about"
          >
            About us
          </Link>
          <a className="py-3 hover:underline underline-offset-8" href="#footer">
            Contact
          </a>
          <button
            className="py-3 hover:underline underline-offset-8"
            onClick={() => onPanel?.("Blogs")}
          >
            Blogs
          </button>
        </nav>
        <div className="col-start-3 row-start-1 flex items-center justify-end gap-1 md:gap-2 lg:gap-4">
          {[
            { name: "Search", icon: "search", mobile: true },
            { name: "Account", icon: "user", mobile: false },
            {
              name: "Wishlist",
              icon: "heart",
              mobile: false,
              count: savedCount,
            },
            {
              name: "Cart",
              panel: "Shopping bag",
              icon: "cart",
              mobile: true,
              count: cartCount,
            },
          ].map((item) => (
            <button
              key={item.name}
              className={`relative min-h-9 min-w-8 items-center justify-center ${
                item.mobile ? "inline-flex" : "hidden lg:inline-flex"
              }`}
              aria-label={item.name}
              onClick={() => onPanel?.(item.panel || item.name)}
            >
              <Icon name={item.icon} />
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -right-1 -top-px size-[18px] rounded-full bg-[#d94b45] text-center font-display text-[11px] leading-[18px] text-white">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>
      {scrolled && (
        <button
          className="fixed bottom-[85px] right-4 z-20 size-10 rounded-full bg-white text-xl shadow-md transition-transform hover:-translate-y-1 md:bottom-8 md:right-8 md:size-12 md:text-2xl"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}
    </>
  );
}
