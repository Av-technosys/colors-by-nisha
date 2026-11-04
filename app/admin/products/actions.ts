"use server";

import { requireAdmin } from "@/helpers/auth/access";

import { readCatalog } from "@/helpers/admin/catalog";
import { getProductList } from "@/helpers/admin/products";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, productMedia, productVariants } from "@/lib/db/schema";
import { confirmImageUpload, deleteImages } from "@/helpers/storage/s3";
import { readUploadReceipt } from "@/helpers/storage/upload-receipt";
import { parseProduct } from "@/helpers/admin/product-input";
import { actionError, validateId, type ActionState } from "@/helpers/admin/validation";

export async function saveProduct(_state: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const removedKeys: string[] = [];
  try {
    const input = parseProduct(form);
    const uploadedMedia = input.media.map(row => ({ ...row, key: row.uploadToken ? readUploadReceipt(row.uploadToken, "products") : null }));
    for (const row of uploadedMedia) {
      if (row.key) await confirmImageUpload(row.key);
    }

    await db.transaction(async tx => {
      let productId = input.id;
      if (productId) {
        const existing = await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).for("update");
        if (!existing.length) throw new Error("This product no longer exists.");
        await tx.update(products).set(input.values).where(eq(products.id, productId));
      } else {
        const [created] = await tx.insert(products).values(input.values).returning({ id: products.id });
        productId = created.id;
      }

      const existingVariants = await tx.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, productId));
      const variantIds = existingVariants.map(row => row.id);
      if (input.variants.some(row => row.id && !variantIds.includes(row.id))) {
        throw new Error("A variant no longer belongs to this product. Reload and try again.");
      }
      const savedVariants = new Map<string, string>();
      for (const { id, clientId, ...values } of input.variants) {
        if (id) {
          await tx.update(productVariants).set(values).where(and(eq(productVariants.id, id), eq(productVariants.productId, productId)));
          savedVariants.set(clientId, id);
        } else {
          const [created] = await tx.insert(productVariants).values({ ...values, productId }).returning({ id: productVariants.id });
          savedVariants.set(clientId, created.id);
        }
      }

      const existingMedia = await tx.select({ id: productMedia.id, key: productMedia.key }).from(productMedia).where(eq(productMedia.productId, productId));
      if (input.media.some(row => row.id && !existingMedia.some(existing => existing.id === row.id))) {
        throw new Error("A media item no longer belongs to this product. Reload and try again.");
      }
      const removedMedia = existingMedia.filter(row => !input.media.some(item => item.id === row.id));
      removedKeys.push(...removedMedia.map(row => row.key));
      if (removedMedia.length) {
        await tx.delete(productMedia).where(and(eq(productMedia.productId, productId), inArray(productMedia.id, removedMedia.map(row => row.id))));
      }
      for (const row of uploadedMedia) {
        const existing = existingMedia.find(item => item.id === row.id);
        const key = row.key ?? existing?.key;
        if (!key) throw new Error("An image has not been uploaded. Please re-upload the image.");
        if (!row.key) await confirmImageUpload(key);
        const variantId = row.variantRef ? savedVariants.get(row.variantRef) : null;
        if (row.variantRef && !variantId) throw new Error("An image refers to a removed variant.");
        const values = {
          key,
          position: row.position,
          variantId: variantId ?? null,
        };
        if (row.id) {
          await tx.update(productMedia).set(values).where(and(eq(productMedia.id, row.id), eq(productMedia.productId, productId)));
          if (existing && row.key && existing.key !== row.key) removedKeys.push(existing.key);
        } else {
          await tx.insert(productMedia).values({ ...values, productId });
        }
      }
      const removedVariants = variantIds.filter(id => !input.variants.some(row => row.id === id));
      if (removedVariants.length) {
        await tx.delete(productVariants).where(and(eq(productVariants.productId, productId), inArray(productVariants.id, removedVariants)));
      }
    });
  } catch (error) {
    return { error: actionError(error) };
  }

  await deleteImages(removedKeys);
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/products/[handle]", "page");
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<ActionState> {
  await requireAdmin();
  let keys: string[] = [];
  try {
    validateId(id);
    keys = await db.transaction(async tx => {
      const existing = await tx.select({ id: products.id }).from(products).where(eq(products.id, id)).for("update");
      if (!existing.length) throw new Error("This product no longer exists.");
      const media = await tx.select({ key: productMedia.key }).from(productMedia).where(eq(productMedia.productId, id));
      await tx.delete(products).where(eq(products.id, id));
      return media.map(row => row.key);
    });
  } catch (error) {
    return { error: actionError(error) };
  }
  await deleteImages(keys);
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/products/[handle]", "page");
  return {};
}

export async function loadProducts() {
  await requireAdmin();
  return readCatalog(async () => {
    const rows = await getProductList();
    return { records: rows.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      fields: {
        SKU: product.sku ?? "—",
        Category: product.category ?? "Uncategorised",
        Price: `₹${Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
    })) };
  });
}
