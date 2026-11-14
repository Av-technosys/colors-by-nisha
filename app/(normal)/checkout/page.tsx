import type { Metadata } from "next";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";

export const metadata: Metadata = { title: "Checkout | Colors by Nisha", robots: { index: false, follow: false } };
export default function CheckoutPage() { return <main className="min-h-screen"><CheckoutContent /></main>; }
