"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useState, type ReactNode } from "react";
import { CreditCard, DoorOpen, FileText, LayoutDashboard, Mail, Menu, Package, ShoppingBag, Tags, Users } from "lucide-react";
import { Toaster } from "sonner";
import { Modal } from "@/components/ui/Modal";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Contact", href: "/admin/contact", icon: Mail },
];

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  function navigate() {
    onNavigate?.();
    scrollToTop();
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-purple px-5 pb-6 pt-8 text-white">
      <Link href="/admin" scroll={false} onNavigate={navigate} className="mb-10 block px-3">
        <span className="block font-display text-[30px] leading-none tracking-tight">
          Colors <span className="font-sans text-sm italic text-[#dcccae]">by</span> Nisha
        </span>
        <span className="mt-3 block text-[9px] uppercase tracking-[0.28em] text-white/50">The administration suite</span>
      </Link>
      <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.2em] text-white/40">Workspace</p>
      <nav aria-label="Admin navigation" className="space-y-1.5">
        {navigation.map(item => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              onNavigate={navigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors ${active ? "bg-white text-purple shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"}`}
            >
              <item.icon size={19} aria-hidden="true" />
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-[#b18b53]" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="flex items-center gap-3 border-t border-white/10 px-2 pt-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eeeaf5] font-display text-sm text-purple">NV</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm">Nisha Vijay</p>
            <p className="text-[10px] text-white/45">Store administrator</p>
          </div>
          <Link href="/" onClick={onNavigate} aria-label="Exit admin" title="Exit admin" className="grid size-9 shrink-0 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            <DoorOpen size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useLayoutEffect(scrollToTop, [pathname]);

  return (
    <div className="min-h-dvh bg-[#f7f6f3] text-ink">
      <Toaster position="bottom-right" richColors />
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-80 focus:bg-white focus:p-3">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[238px] lg:block"><Sidebar /></aside>
      {menuOpen && (
        <Modal title="Admin navigation" onClose={closeMenu} className="h-[85dvh] w-full max-w-sm">
          <Sidebar onNavigate={closeMenu} />
        </Modal>
      )}
      <div className="min-w-0 lg:pl-[238px]">
        <button
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-purple text-white shadow-lg lg:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <main id="admin-content" className="mx-auto max-w-[1600px] p-5 sm:p-8 xl:p-10">{children}</main>
      </div>
    </div>
  );
}
