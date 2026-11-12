"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, FileText, Palette, RotateCcw, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import { policies, type PolicyKey } from "./AccountPolicies";

const policyLinks = [
  { key: "privacy", label: "Privacy policy", icon: ShieldCheck },
  { key: "terms", label: "Terms & conditions", icon: FileText },
  { key: "refund", label: "Returns & refunds", icon: RotateCcw },
  { key: "customization", label: "Customization", icon: Palette },
] as const;

function AccountLinks({ pathname = "" }: { pathname?: string }) {
  const links = [
    { href: "/dashboard", label: "Account details", icon: UserRound, active: pathname === "/dashboard" || pathname === "/account" },
    { href: "/orders", label: "My orders", icon: ShoppingBag, active: pathname === "/orders" || pathname.startsWith("/orders/") },
  ];
  return <nav aria-label="Dashboard navigation" className="grid grid-cols-2 gap-1 lg:block lg:space-y-1">
    {links.map(({ href, label, icon: Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-12 min-w-0 items-center gap-2 rounded-md px-2 text-xs transition lg:gap-3 lg:px-3 lg:text-sm ${active ? "bg-[#f2eff6] text-purple" : "text-neutral-600 hover:bg-[#f7f5f1] hover:text-purple"}`}><Icon size={16} className="shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1">{label}</span><ChevronRight size={14} className="hidden lg:block" aria-hidden="true" /></Link>)}
  </nav>;
}

function ActiveAccountLinks() {
  return <AccountLinks pathname={usePathname()} />;
}

export function AccountSidebar({ children }: { children: ReactNode }) {
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);
  const [showPolicies, setShowPolicies] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePolicy = useCallback(() => setActivePolicy(null), []);

  useEffect(() => {
    if (!activePolicy) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePolicy();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePolicy, closePolicy]);

  return <aside aria-label="Account sidebar" className="space-y-5 lg:sticky lg:top-[124px]">
    {children}
    <div className="rounded-md border border-[#e8e3da] bg-white p-3">
      <Suspense fallback={<AccountLinks />}><ActiveAccountLinks /></Suspense>
      <p className="hidden px-3 pb-2 pt-5 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400 lg:block">Helpful information</p>
      <button type="button" aria-expanded={showPolicies} aria-controls="account-policies" onClick={() => setShowPolicies(value => !value)} className="mt-2 flex min-h-11 w-full items-center justify-between border-t border-[#eeeae4] px-2 text-xs text-neutral-500 lg:hidden">Helpful information<ChevronRight size={14} className={showPolicies ? "rotate-90" : ""} aria-hidden="true" /></button>
      <nav id="account-policies" aria-label="Account policies" className={`${showPolicies ? "block" : "hidden"} lg:block`}>{policyLinks.map(({ key, label, icon: Icon }) => <button type="button" key={key} onClick={() => setActivePolicy(key)} className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-neutral-600 transition hover:bg-[#f7f5f1] hover:text-purple"><Icon size={16} className="shrink-0 text-neutral-400" aria-hidden="true" /><span className="flex-1">{label}</span><ChevronRight size={14} className="text-neutral-300" aria-hidden="true" /></button>)}</nav>
    </div>
    {mounted && activePolicy && createPortal(
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs sm:p-6"
        onClick={closePolicy}
        role="dialog"
        aria-modal="true"
        aria-label={policies[activePolicy].title}
      >
        <div
          className="relative flex max-h-[calc(100dvh-2.5rem)] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3.5rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header pinned cleanly at the top */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#eeeae4] px-5 py-4 sm:px-7 sm:py-5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">Helpful information</p>
              <h2 className="font-display text-xl font-medium text-ink sm:text-2xl">{policies[activePolicy].title}</h2>
            </div>
            <button
              type="button"
              onClick={closePolicy}
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-md text-neutral-500 hover:bg-[#f7f5f1] hover:text-ink transition cursor-pointer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Policy content scrolls cleanly without cutting off the header */}
          <div className="overflow-y-auto overscroll-contain p-5 sm:p-7 text-sm leading-relaxed text-ink">
            {policies[activePolicy].content}
          </div>
        </div>
      </div>,
      document.body
    )}
  </aside>;
}
