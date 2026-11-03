import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/helpers/admin/categories";

export const metadata: Metadata = { title: "Add product" };

async function NewProduct() {
  await connection();
  return <ProductForm categoryOptions={await getCategories()} />;
}

export default function NewProductPage() {
  return <Suspense fallback={<p className="text-sm text-neutral-500">Loading product form…</p>}><NewProduct /></Suspense>;
}
