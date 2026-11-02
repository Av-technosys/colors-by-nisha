import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShopPageContent } from "@/components/shop/ShopPageContent";
import { CartDrawer } from "@/components/store/CartDrawer";

export const metadata: Metadata = {
  title: "Shop Designer Lehengas, Sarees & Ethnic Wear | Colors by Nisha Vijay",
  description:
    "Explore our handcrafted collection of designer lehengas, silk sarees, and contemporary ethnic wear. Exquisite embroidery and artisanal perfection.",
};

async function ShopLoader({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<{ category?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const initialCategory = searchParams?.category || "all";
  return <ShopPageContent initialCategory={initialCategory} />;
}

export default function ShopPage(props: {
  searchParams?: Promise<{ category?: string }>;
}) {
  return (
    <div className="min-h-screen bg-white text-ink flex flex-col">
      <Header solid={true} activeNav="shop" />
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="py-28 text-center text-sm text-neutral-400 animate-pulse font-display uppercase tracking-wider">
              Loading Colors by Nisha Collection...
            </div>
          }
        >
          <ShopLoader searchParamsPromise={props.searchParams} />
        </Suspense>
      </div>
      <CartDrawer />
      <Footer />
    </div>
  );
}
