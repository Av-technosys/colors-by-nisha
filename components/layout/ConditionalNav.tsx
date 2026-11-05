"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { usePathname } from "next/navigation";

export function ConditionalHeader() {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/signup" ||
    pathname === "/sign-up" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-otp" ||
    pathname === "/sso-callback" ||
    pathname?.startsWith("/signup/") ||
    pathname?.startsWith("/sign-up/") ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/forgot-password/") ||
    pathname?.startsWith("/verify-otp/");

  if (isAuthPage) return null;
  return <Header />;
}

export function ConditionalFooter() {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/signup" ||
    pathname === "/sign-up" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-otp" ||
    pathname === "/sso-callback" ||
    pathname?.startsWith("/signup/") ||
    pathname?.startsWith("/sign-up/") ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/forgot-password/") ||
    pathname?.startsWith("/verify-otp/");

  const isDashboard =
    ["/dashboard", "/account", "/orders"].some(path => pathname === path || pathname?.startsWith(`${path}/`));

  if (isAuthPage || isDashboard) return null;
  return <Footer />;
}

export function ConditionalMobileNavigation() {
  const pathname = usePathname();
  const hidden = ["/signup", "/sign-up", "/login", "/forgot-password", "/verify-otp", "/sso-callback"].some(path => pathname === path || pathname.startsWith(`${path}/`));
  if (hidden) return null;
  return <MobileNavigation />;
}

