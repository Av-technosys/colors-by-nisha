import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getStoreProduct, getRelatedStoreProducts } from "@/helpers/store/products";
import { PDPPageContent } from "@/components/pdp/PDPPageContent";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getStoreProduct(handle);
  if (!product) return { title: "Product Not Found | Colors by Nisha Vijay" };
  const title = `${product.metaTitle || product.name} | Colors by Nisha Vijay`;
  const description = product.metaDescription || product.shortDescription || product.description;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: product.images[0], alt: product.name }] },
  };
}

async function ProductContent({ params }: PageProps) {
  const { handle } = await params;
  const product = await getStoreProduct(handle);
  if (!product) notFound();
  const relatedProducts = await getRelatedStoreProducts(product);
  return <PDPPageContent key={product.id} product={product} relatedProducts={relatedProducts} />;
}

export default function ProductDetailPage(props: PageProps) {
  return <Suspense fallback={<div className="min-h-[60vh] grid place-items-center text-sm text-neutral-500">Loading product…</div>}>
    <ProductContent {...props} />
  </Suspense>;
}
