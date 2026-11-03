"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";

export function ConditionalHeader() {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/signup" ||
    pathname === "/sign-up" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-otp" ||
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
    pathname?.startsWith("/signup/") ||
    pathname?.startsWith("/sign-up/") ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/forgot-password/") ||
    pathname?.startsWith("/verify-otp/");

  const isDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  if (isAuthPage || isDashboard) return null;
  return <Footer />;
}

