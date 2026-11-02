import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/data/products";
import { PDPPageContent } from "@/components/pdp/PDPPageContent";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    handle: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductBySlug(handle);

  if (!product) {
    return {
      title: "Product Not Found | Colors by Nisha Vijay",
    };
  }

  return {
    title: `${product.name} | Colors by Nisha Vijay`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Colors by Nisha Vijay`,
      description: product.description.slice(0, 160),
      images: [
        {
          url: product.images[0],
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params;
  const product = getProductBySlug(handle);

  if (!product) {
    notFound();
  }

  return <PDPPageContent product={product} />;
}

