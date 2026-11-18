import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products, productCategories, productMedia, productVariants } from "@/lib/db/schema";
import { validateId } from "./validation";

export type ProductDetails = typeof products.$inferSelect & {
  productCategories: { categoryId: string }[];
  variants: (typeof productVariants.$inferSelect)[];
  media: (typeof productMedia.$inferSelect & { url: string })[];
};

export async function getProductList() {
  const rows = await db.query.products.findMany({
    with: { category: true, productCategories: { with: { category: true } } },
    orderBy: [desc(products.createdAt)],
  });
  return rows.map(row => ({ ...row, category: row.productCategories.length ? row.productCategories.map(link => link.category.name).join(", ") : row.category?.name ?? "" }));
}

export async function getProductsByCategory(categoryId: string) {
  validateId(categoryId);
  return db.select({ product: products }).from(products)
    .innerJoin(productCategories, eq(productCategories.productId, products.id))
    .where(eq(productCategories.categoryId, categoryId));
}

export async function getCategoriesForProduct(productId: string) {
  validateId(productId);
  return db.select({ category: categories }).from(categories)
    .innerJoin(productCategories, eq(productCategories.categoryId, categories.id))
    .where(eq(productCategories.productId, productId));
}

export async function getProduct(id: string): Promise<ProductDetails | undefined> {
  validateId(id);
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      productCategories: true,
      variants: { orderBy: [asc(productVariants.name)] },
      media: { orderBy: [asc(productMedia.position), asc(productMedia.id)] },
    },
  });
  if (!product) return undefined;
  return { ...product, media: product.media.map(image => ({ ...image, url: `/api/admin/products/media/${image.id}` })) };
}
