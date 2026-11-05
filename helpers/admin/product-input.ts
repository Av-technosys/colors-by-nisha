import { UserFacingError } from "@/helpers/errors";
import { MAX_PRODUCT_IMAGES } from "@/helpers/storage/image-limits";
import { optionalText, requiredText, validateId, validatePrice, validateSlug } from "./validation";

export const productStatuses = ["draft", "active", "out_of_stock", "archived"];

export type VariantInput = { id: string; clientId: string; name: string; sku: string; price: string; stock: string; originalStock?: string };
export type MediaInput = { id: string; uploadToken: string; variantRef: string; position: string };

function readRows(form: FormData, key: string): Record<string, unknown>[] {
  let rows: unknown;
  try { rows = JSON.parse(String(form.get(key) ?? "[]")); }
  catch { throw new UserFacingError(`Invalid ${key} data.`); }
  if (!Array.isArray(rows) || rows.length > 100 || rows.some(row => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new UserFacingError(`${key} must contain no more than 100 rows.`);
  }
  return rows;
}

function rowText(row: Record<string, unknown>, key: string, max: number, required = false) {
  const value = String(row[key] ?? "").trim();
  if (required && !value) throw new UserFacingError(`${key} is required for each row.`);
  if (value.length > max) throw new UserFacingError(`${key} must be ${max} characters or fewer.`);
  return value;
}

function wholeNumber(value: string, label: string) {
  if (!/^\d+$/.test(value) || Number(value) > 2_147_483_647) {
    throw new UserFacingError(`${label} must be a non-negative whole number.`);
  }
  return Number(value);
}

export function stockForUpdate(current: number | null, requested: number | null, original: number | null | undefined) {
  if (original === undefined) throw new UserFacingError("Please reload this product before saving stock changes.");
  if (requested === original) return current;
  if (current !== original) throw new UserFacingError("Stock changed while you were editing. Reload this product before changing its quantity.");
  return requested;
}

export function parseProduct(form: FormData) {
  const id = String(form.get("id") ?? "");
  if (id) validateId(id);
  const categoryId = optionalText(form, "categoryId");
  if (categoryId) validateId(categoryId);
  let status = requiredText(form, "status", "Status", 20);
  if (!productStatuses.includes(status)) throw new UserFacingError("Choose a valid product status.");

  const variants = readRows(form, "variants").map((row, index) => {
    const rowId = rowText(row, "id", 36);
    if (rowId) validateId(rowId);
    const stock = rowText(row, "stock", 10);
    const originalStock = typeof row.originalStock === "string" ? rowText(row, "originalStock", 10) : undefined;
    return {
      id: rowId,
      clientId: rowText(row, "clientId", 80) || rowId || `variant-${index}`,
      name: rowText(row, "name", 255, true),
      sku: rowText(row, "sku", 100) || null,
      price: validatePrice(rowText(row, "price", 20, true), "Variant price"),
      stock: stock ? wholeNumber(stock, "Stock") : null,
      originalStock: originalStock === undefined ? undefined : originalStock ? wholeNumber(originalStock, "Stock") : null,
    };
  });

  if (status === "active" && variants.length && variants.every(variant => variant.stock === 0)) status = "out_of_stock";

  const variantRefs = variants.map(row => row.clientId);
  if (new Set(variantRefs).size !== variantRefs.length) throw new UserFacingError("A variant was included more than once.");
  const media = readRows(form, "media").map((row, index) => {
    const rowId = rowText(row, "id", 36);
    if (rowId) validateId(rowId);
    const variantRef = rowText(row, "variantRef", 80);
    if (variantRef && !variantRefs.includes(variantRef)) throw new UserFacingError("An image refers to a removed variant.");
    const uploadToken = rowText(row, "uploadToken", 2048);
    if (!rowId && !uploadToken) throw new UserFacingError("An image has not finished uploading. Please re-upload the image.");
    return {
      id: rowId,
      variantRef,
      uploadToken,
      position: wholeNumber(rowText(row, "position", 10) || String(index), "Media position"),
    };
  });
  if (media.length > MAX_PRODUCT_IMAGES) throw new UserFacingError("Add no more than 20 images per product, including variant images.");

  for (const rows of [variants, media]) {
    const ids = rows.map(row => row.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) throw new UserFacingError("A row was included more than once.");
  }

  return {
    id,
    values: {
      name: requiredText(form, "name", "Product name", 255),
      slug: validateSlug(requiredText(form, "slug", "Slug", 255)),
      sku: optionalText(form, "sku", 100),
      description: optionalText(form, "description"),
      price: validatePrice(requiredText(form, "price", "Price", 20)),
      categoryId,
      shortDescription: optionalText(form, "shortDescription"),
      status,
      metaTitle: optionalText(form, "metaTitle", 255),
      metaDescription: optionalText(form, "metaDescription"),
    },
    variants,
    media,
  };
}
