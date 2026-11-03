import type { Metadata } from "next";
import { getShopProducts } from "@/helpers/store/products";
import { Suspense } from "react";
import { ShopPageContent } from "@/components/shop/ShopPageContent";

export const metadata: Metadata = {
  title: "Shop Designer Lehengas, Sarees & Ethnic Wear | Colors by Nisha Vijay",
  description: "Browse our handcrafted collection of royal lehengas, festive sarees, and contemporary festive ensembles.",
};

async function ShopLoader({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<{ category?: string; search?: string; query?: string; q?: string; sort?: string }>;
}) {
  const params = searchParamsPromise ? await searchParamsPromise : {};
  const products = await getShopProducts();
  const search = params.search || params.query || params.q || "";

  return (
    <ShopPageContent
      products={products}
      initialCategory={params.category}
      initialSearch={search}
    />
  );
}

export default function ShopPage(props: {
  searchParams?: Promise<{ category?: string; search?: string; query?: string; q?: string; sort?: string }>;
}) {
  return (
    <div className="min-h-screen bg-white text-ink flex flex-col">
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-neutral-400">
              Loading curated collection...
            </div>
          }
        >
          <ShopLoader searchParamsPromise={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
