"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/components/store/StoreContext";
import { images } from "@/data/home";

export function MobileMenuDrawer() {
  const { cart, menuOpen, setMenuOpen, setCartOpen, wishlist } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, setMenuOpen]);

  if (!menuOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
      style={{ overscrollBehavior: "contain" }}
      onClick={() => setMenuOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      <div
        className="relative flex h-full w-[85%] max-w-[340px] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-250"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="relative block h-14 w-12">
            <Image src={images[1]} alt="Colors by Nisha" fill sizes="80px" className="object-contain" priority />
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="grid size-9 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-ink transition"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-neutral-100 font-display" style={{ overscrollBehavior: "contain" }}>
          <div className="py-2 space-y-1">
            <Link
              href="/"
              onClick={() => {
                setMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center justify-between py-2.5 text-base font-semibold text-ink hover:text-[#a66c40] transition"
            >
              <span>Home</span>
              <span className="text-neutral-400">›</span>
            </Link>

            {/* SHOP LINK - Navigates directly to /shop */}
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between py-2.5 text-base font-bold text-ink bg-neutral-50 px-3 rounded-md hover:bg-neutral-100 transition"
            >
              <span className="uppercase tracking-wide text-ink">Shop All Products</span>
              <span className="text-xs rounded-md bg-[#2d254d] text-white px-2 py-0.5">Explore</span>
            </Link>
          </div>

          {/* Categories */}
          <div className="py-3 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block px-1 pb-1">
              Categories
            </span>
            {[
              { name: "Lehengas", href: "/shop?category=lehenga" },
              { name: "Sarees", href: "/shop?category=saree" },
              { name: "Contemporary Ethnic", href: "/shop?category=ethnic" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-2 px-1 text-sm text-neutral-700 hover:text-ink transition"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-neutral-400">›</span>
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div className="py-3 space-y-1 text-sm text-neutral-700">
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="block py-2 px-1 hover:text-ink transition"
            >
              About us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block py-2 px-1 hover:text-ink transition"
            >
              Contact
            </Link>
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="block py-2 px-1 hover:text-ink transition"
            >
              Blogs & Journal
            </Link>
          </div>

          {/* Bag & Wishlist shortcuts */}
          <div className="py-3 space-y-2">
            <button
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(true);
              }}
              className="flex w-full items-center justify-between py-2 px-1 text-sm text-neutral-700 hover:text-ink text-left"
            >
              <span>Shopping Cart ({cartCount})</span>
              <span className="text-xs text-neutral-400">View</span>
            </button>
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center justify-between py-2 px-1 text-sm text-neutral-700 hover:text-ink text-left"
            >
              <span>Wishlist ({wishlist.length})</span>
              <span className="text-xs text-neutral-400">View</span>
            </Link>
          </div>
        </nav>

        {/* Footer Support */}
        <div className="border-t border-neutral-100 p-5 bg-[#faf8f5] space-y-3">
          <a
            href="https://wa.me/919799330455?text=Hello%20Colors%20by%20Nisha!%20I%20need%20assistance."
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] py-2.5 px-4 text-xs font-semibold uppercase text-white shadow-xs"
          >
            WhatsApp Stylist Support
          </a>
          <p className="text-[11px] text-center text-neutral-500">
            Jaipur, Rajasthan · <a href="tel:+919799330455" className="underline">+91 97993 30455</a>
          </p>
        </div>
      </div>
    </div>
  );
}

