"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { requireAdmin } from "@/helpers/auth/access";
import { getBlogCategoryList } from "@/helpers/admin/blog-categories";
import { actionError, requiredText, validateId, validateSlug } from "@/helpers/admin/validation";

function refreshBlogs() {
  revalidatePath("/admin/blogs", "layout");
  revalidatePath("/blog", "layout");
}

export async function loadBlogCategories() {
  await requireAdmin();
  try { return { categories: await getBlogCategoryList() }; }
  catch { return { error: "Blog categories could not be loaded. Please try again." }; }
}

export async function saveBlogCategory(form: FormData) {
  await requireAdmin();
  try {
    const id = String(form.get("id") ?? "");
    const values = { name: requiredText(form, "name", "Category name", 255), slug: validateSlug(requiredText(form, "slug", "Slug", 255)) };
    let category;
    if (id) {
      validateId(id);
      [category] = await db.update(blogCategories).set(values).where(eq(blogCategories.id, id)).returning();
      if (!category) return { error: "This blog category no longer exists." };
    } else [category] = await db.insert(blogCategories).values(values).returning();
    refreshBlogs();
    return { category };
  } catch (error) { return { error: actionError(error) }; }
}

export async function deleteBlogCategory(id: string) {
  await requireAdmin();
  try {
    validateId(id);
    const [deleted] = await db.delete(blogCategories).where(eq(blogCategories.id, id)).returning({ id: blogCategories.id });
    if (!deleted) return { error: "This blog category no longer exists." };
    refreshBlogs();
    return { id: deleted.id };
  } catch (error) {
    const databaseError = error as { code?: string; cause?: { code?: string } };
    if ((databaseError.cause?.code ?? databaseError.code) === "23503") return { error: "Move the blogs in this category to another category before deleting it." };
    return { error: actionError(error) };
  }
}
