import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products, productMedia, productVariants } from "@/lib/db/schema";
import { validateId } from "./validation";

export type ProductDetails = typeof products.$inferSelect & {
  variants: (typeof productVariants.$inferSelect)[];
  media: (typeof productMedia.$inferSelect & { url: string })[];
};

export async function getProductList() {
  return db.select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    sku: products.sku,
    price: products.price,
    status: products.status,
    category: categories.name,
  })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}

export async function getProduct(id: string): Promise<ProductDetails | undefined> {
  validateId(id);
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: { orderBy: [asc(productVariants.name)] },
      media: { orderBy: [asc(productMedia.position), asc(productMedia.id)] },
    },
  });
  if (!product) return undefined;
  return { ...product, media: product.media.map(image => ({ ...image, url: `/api/admin/products/media/${image.id}` })) };
}
