import "server-only";

import { asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogCategories, blogs } from "@/lib/db/schema";

export async function getBlogCategories() {
  return db.select().from(blogCategories).orderBy(asc(blogCategories.name));
}

export async function getBlogCategoryList() {
  return db.select({ id: blogCategories.id, name: blogCategories.name, slug: blogCategories.slug, blogCount: count(blogs.id) })
    .from(blogCategories).leftJoin(blogs, eq(blogs.categoryId, blogCategories.id))
    .groupBy(blogCategories.id).orderBy(asc(blogCategories.name));
}

export type BlogCategoryRow = Awaited<ReturnType<typeof getBlogCategoryList>>[number];
