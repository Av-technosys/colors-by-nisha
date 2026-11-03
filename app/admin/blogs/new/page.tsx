import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import BlogForm from "@/components/admin/blogs/BlogForm";
import { getCategories } from "@/helpers/admin/categories";

export const metadata: Metadata = { title: "Add blog" };

async function NewBlog() {
  await connection();
  return <BlogForm categories={await getCategories()} />;
}

export default function NewBlogPage() {
  return <Suspense fallback={<p className="text-sm text-neutral-500">Loading blog form…</p>}><NewBlog /></Suspense>;
}
