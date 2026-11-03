import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/blogs/BlogForm";
import { getBlog } from "@/helpers/admin/blogs";
import { getCategories } from "@/helpers/admin/categories";
import { validateId } from "@/helpers/admin/validation";

export const metadata: Metadata = { title: "Edit blog" };

type PageProps = { params: Promise<{ id: string }> };

async function EditBlog({ params }: PageProps) {
  await connection();
  const { id } = await params;
  try { validateId(id); } catch { notFound(); }
  const [blog, categories] = await Promise.all([getBlog(id), getCategories()]);
  if (!blog) notFound();
  return <BlogForm initialBlog={blog} categories={categories} />;
}

export default function EditBlogPage({ params }: PageProps) {
  return <Suspense fallback={<p className="text-sm text-neutral-500">Loading blog…</p>}><EditBlog params={params} /></Suspense>;
}
