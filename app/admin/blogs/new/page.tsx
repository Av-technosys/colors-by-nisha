import { FormSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import BlogForm from "@/components/admin/blogs/BlogForm";
import { getBlogCategories } from "@/helpers/admin/blog-categories";

export const metadata: Metadata = { title: "Add blog" };

async function NewBlog() {
  await connection();
  return <BlogForm categories={await getBlogCategories()} />;
}

export default function NewBlogPage() {
  return <Suspense fallback={<FormSkeleton />}><NewBlog /></Suspense>;
}
