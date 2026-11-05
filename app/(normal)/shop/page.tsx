import { CollectionSkeleton } from "@/components/ui/PageSkeletons";
import type { Metadata } from "next";
import { getShopProducts } from "@/helpers/store/products";
import { Suspense } from "react";
import { ShopPageContent } from "@/components/shop/ShopPageContent";

export const metadata: Metadata = {
  title: "Shop Designer Lehengas, Sarees & Ethnic Wear | Colors by Nisha Vijay",
  description: "Browse our handcrafted collection of royal lehengas, festive sarees, and contemporary festive ensembles.",
};

async function ShopLoader() {
  const products = await getShopProducts();

  return (
    <ShopPageContent
      products={products}
    />
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white text-ink flex flex-col">
      <div className="flex-1">
        <Suspense
          fallback={<CollectionSkeleton />}
        >
          <ShopLoader />
        </Suspense>
      </div>
    </div>
  );
}
