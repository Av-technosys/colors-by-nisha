import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProduct } from "@/helpers/admin/products";
import { getCategories } from "@/helpers/admin/categories";
import { validateId } from "@/helpers/admin/validation";

export const metadata: Metadata = { title: "Edit product" };

type PageProps = { params: Promise<{ id: string }> };

async function EditProduct({ params }: PageProps) {
  await connection();
  const { id } = await params;
  try { validateId(id); } catch { notFound(); }
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);
  if (!product) notFound();
  return <ProductForm product={product} categoryOptions={categories} />;
}

export default function EditProductPage({ params }: PageProps) {
  return <Suspense fallback={<p className="text-sm text-neutral-500">Loading product…</p>}><EditProduct params={params} /></Suspense>;
}
