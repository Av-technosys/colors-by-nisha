import "server-only";

import { cache } from "react";
import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { io } from "next/cache";
import { db } from "@/lib/db";
import { categories, products, productMedia, productVariants } from "@/lib/db/schema";
import { imageUrl } from "@/helpers/storage/s3";
import type { ProductItem } from "@/data/products";

const published = inArray(products.status, ["active", "out_of_stock"]);
const productRelations = {
  category: true as const,
  variants: { orderBy: [asc(productVariants.name)] },
  media: { orderBy: [asc(productMedia.position), asc(productMedia.id)] },
};

type ProductRecord = NonNullable<Awaited<ReturnType<typeof readProduct>>>;

function readProduct(slug: string) {
  return db.query.products.findFirst({
    where: and(published, eq(products.slug, slug)),
    with: productRelations,
  });
}

async function toProduct(row: ProductRecord): Promise<ProductItem> {
  const media = await Promise.all(row.media.map(async image => ({ ...image, url: await imageUrl(image.key) })));
  const mainImages = media.filter(image => !image.variantId).map(image => image.url);
  const images = mainImages.length ? mainImages : media.map(image => image.url);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    category: row.category?.name ?? "",
    categorySlug: row.category?.slug,
    description: row.description ?? "",
    shortDescription: row.shortDescription ?? "",
    metaTitle: row.metaTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    createdAt: row.createdAt.toISOString(),
    inStock: row.status === "active" && (!row.variants.length || row.variants.some(variant => variant.stock === null || variant.stock > 0)),
    images: images.length ? images : ["/product-placeholder.svg"],
    variants: row.variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price),
      stock: variant.stock,
      images: media.filter(image => image.variantId === variant.id).map(image => image.url),
    })),
  };
}

export const getShopProducts = cache(async () => {
  await io();
  const rows = await db.query.products.findMany({
    where: published,
    with: productRelations,
    orderBy: [desc(products.createdAt), asc(products.id)],
  });
  return Promise.all(rows.map(toProduct));
});

export const getStoreProduct = cache(async (slug: string) => {
  await io();
  const row = await readProduct(slug);
  return row ? toProduct(row) : undefined;
});

export async function getRelatedStoreProducts(product: ProductItem) {
  const rows = await db.query.products.findMany({
    where: and(published, ne(products.id, product.id)),
    with: productRelations,
    orderBy: [
      sql`case when ${products.categoryId} in (select ${categories.id} from ${categories} where ${categories.slug} = ${product.categorySlug ?? ""}) then 0 else 1 end`,
      desc(products.createdAt), asc(products.id),
    ],
    limit: 4,
  });
  return Promise.all(rows.map(toProduct));
}
