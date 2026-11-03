"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";
import React from "react";

export default function NormalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages where Header should NOT be shown
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

  // Pages where Footer should NOT be shown
  const isDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  const showHeader = !isAuthPage;
  const showFooter = !isAuthPage && !isDashboard;

  return (
    <>
      {showHeader && <Header />}
      {children}
      {showFooter && <Footer />}
    </>
  );
}
