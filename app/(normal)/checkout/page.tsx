import type { Metadata } from "next";
import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { getCustomerAccount } from "@/helpers/auth/addresses";

export const metadata: Metadata = { title: "Checkout | Colors by Nisha", robots: { index: false, follow: false } };
async function Checkout() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { account } = await getCustomerAccount(user);
  return <CheckoutContent account={account} />;
}
export default function CheckoutPage() {
  return <Suspense fallback={<p className="py-24 text-center text-sm text-neutral-500">Loading checkout…</p>}><Checkout /></Suspense>;
}
