import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getCategory } from "@/helpers/admin/categories";
import { validateId } from "@/helpers/admin/validation";

export const metadata: Metadata = { title: "Edit category" };

type PageProps = { params: Promise<{ id: string }> };

async function EditCategory({ params }: PageProps) {
  await connection();
  const { id } = await params;
  try { validateId(id); } catch { notFound(); }
  const category = await getCategory(id);
  if (!category) notFound();
  return <CategoryForm category={category} />;
}

export default function EditCategoryPage({ params }: PageProps) {
  return <Suspense fallback={<p className="text-sm text-neutral-500">Loading category…</p>}><EditCategory params={params} /></Suspense>;
}
