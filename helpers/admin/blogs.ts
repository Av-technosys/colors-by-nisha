import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs, blogCategories } from "@/lib/db/schema";
import { validateId } from "./validation";
import { sanitizeBlogContent } from "./blog-content.server";
import type { AdminBlog } from "@/components/admin/blogs/blog-fields";

export async function getBlogList() {
  return db.select({
    id: blogs.id,
    title: blogs.title,
    slug: blogs.slug,
    category: blogCategories.name,
    categoryId: blogs.categoryId,
    authorName: blogs.authorName,
    publishDate: blogs.publishDate,
    isDraft: blogs.isDraft,
  }).from(blogs).innerJoin(blogCategories, eq(blogs.categoryId, blogCategories.id)).orderBy(desc(blogs.createdAt));
}

export async function getBlog(id: string): Promise<AdminBlog | undefined> {
  validateId(id);
  const [blog] = await db.select({
    id: blogs.id,
    title: blogs.title,
    slug: blogs.slug,
    categoryId: blogs.categoryId,
    authorName: blogs.authorName,
    publishDate: blogs.publishDate,
    metaTitle: blogs.metaTitle,
    metaDescription: blogs.metaDescription,
    content: blogs.content,
    isDraft: blogs.isDraft,
    updatedAt: blogs.updatedAt,
  }).from(blogs).where(eq(blogs.id, id)).limit(1);
  if (!blog) return undefined;
  const { updatedAt, ...values } = blog;
  return {
    ...values,
    metaTitle: values.metaTitle ?? "",
    content: sanitizeBlogContent(values.content),
    mainBannerImage: `/api/admin/blogs/${blog.id}/image?v=${updatedAt.getTime()}`,
  };
}
