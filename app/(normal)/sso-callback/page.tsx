import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleCallback } from "@/components/auth/GoogleCallback";

export const metadata: Metadata = { title: "Google sign-in | Colors by Nisha Vijay", robots: { index: false } };

export default function SSOCallbackPage() {
  return <Suspense fallback={null}><GoogleCallback /></Suspense>;
}
