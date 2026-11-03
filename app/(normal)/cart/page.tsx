import type { Metadata } from "next";
import { Suspense } from "react";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { getShopProducts } from "@/helpers/store/products";

export const metadata: Metadata = {
  title: "Your Shopping Cart | Colors by Nisha Vijay",
  description:
    "Review your selected designer lehengas and ethnic wear before checkout. Complimentary insured delivery across India.",
};

async function DynamicCartContent() {
  let products: Awaited<ReturnType<typeof getShopProducts>> = [];
  try {
    products = await getShopProducts();
  } catch {
    // fallback handled inside CartPageContent
  }
  return <CartPageContent initialCrossSellProducts={products} />;
}

export default function CartPage() {
  return (
    <main className="min-h-screen bg-white text-ink flex flex-col">
      <Suspense fallback={<CartPageContent />}>
        <DynamicCartContent />
      </Suspense>
    </main>
  );
}

