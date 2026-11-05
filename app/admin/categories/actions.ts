"use server";

import { requireAdmin } from "@/helpers/auth/access";

import { readCatalog } from "@/helpers/admin/catalog";
import { getCategoryList } from "@/helpers/admin/categories";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { actionError, requiredText, validateId, validateSlug, type ActionState } from "@/helpers/admin/validation";

export async function saveCategory(_state: ActionState, form: FormData): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin();
  try {
    const id = String(form.get("id") ?? "");
    const values = {
      name: requiredText(form, "name", "Category name", 255),
      slug: validateSlug(requiredText(form, "slug", "Slug", 255)),
    };

    if (id) {
      validateId(id);
      const updated = await db.update(categories).set(values).where(eq(categories.id, id)).returning({ id: categories.id });
      if (!updated.length) return { error: "This category no longer exists." };
    } else {
      await db.insert(categories).values(values);
    }
  } catch (error) {
    return { error: actionError(error) };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/products/[handle]", "page");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionState> {
  await requireAdmin();
  try {
    validateId(id);
    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    if (!deleted.length) return { error: "This category no longer exists." };
  } catch (error) {
    return { error: actionError(error) };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/products/[handle]", "page");
  revalidatePath("/admin/products");
  return {};
}

export async function loadCategories() {
  await requireAdmin();
  return readCatalog(async () => {
    const rows = await getCategoryList();
    return { records: rows.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      fields: { Products: String(category.productCount) },
    })) };
  });
}
