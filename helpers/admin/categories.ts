import "server-only";

import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, productCategories, products } from "@/lib/db/schema";
import { validateId } from "./validation";

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryList() {
  return db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    productCount: sql<number>`(select count(*)::int from ${products} where ${products.categoryId} = ${categories.id} or exists (select 1 from ${productCategories} where ${productCategories.productId} = ${products.id} and ${productCategories.categoryId} = ${categories.id}))`,
  })
    .from(categories)
    .orderBy(asc(categories.name));
}

export async function getCategory(id: string) {
  validateId(id);
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return category;
}
