"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useState, type ReactNode } from "react";
import { ChevronRight, FileText, Palette, RotateCcw, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
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
  const closePolicy = useCallback(() => setActivePolicy(null), []);
  return <aside aria-label="Account sidebar" className="space-y-5 lg:sticky lg:top-[124px]">
    {children}
    <div className="rounded-md border border-[#e8e3da] bg-white p-3">
      <Suspense fallback={<AccountLinks />}><ActiveAccountLinks /></Suspense>
      <p className="hidden px-3 pb-2 pt-5 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400 lg:block">Helpful information</p>
      <button type="button" aria-expanded={showPolicies} aria-controls="account-policies" onClick={() => setShowPolicies(value => !value)} className="mt-2 flex min-h-11 w-full items-center justify-between border-t border-[#eeeae4] px-2 text-xs text-neutral-500 lg:hidden">Helpful information<ChevronRight size={14} className={showPolicies ? "rotate-90" : ""} aria-hidden="true" /></button>
      <nav id="account-policies" aria-label="Account policies" className={`${showPolicies ? "block" : "hidden"} lg:block`}>{policyLinks.map(({ key, label, icon: Icon }) => <button type="button" key={key} onClick={() => setActivePolicy(key)} className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-neutral-600 transition hover:bg-[#f7f5f1] hover:text-purple"><Icon size={16} className="shrink-0 text-neutral-400" aria-hidden="true" /><span className="flex-1">{label}</span><ChevronRight size={14} className="text-neutral-300" aria-hidden="true" /></button>)}</nav>
    </div>
    {activePolicy && <Modal title={policies[activePolicy].title} onClose={closePolicy} className="w-full max-w-2xl p-6 md:p-8"><h2 className="mb-6 pr-8 font-display text-2xl font-medium">{policies[activePolicy].title}</h2><div className="space-y-4 text-sm leading-relaxed">{policies[activePolicy].content}</div></Modal>}
  </aside>;
}
