import "server-only";

import { asc, countDistinct, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { validateId } from "./validation";

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryList() {
  return db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    productCount: countDistinct(products.id),
  })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

export async function getCategory(id: string) {
  validateId(id);
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return category;
}
