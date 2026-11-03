import { MAX_PRODUCT_IMAGES } from "@/helpers/storage/image-limits";
import { optionalText, requiredText, validateId, validatePrice, validateSlug } from "./validation";

export type VariantInput = { id: string; clientId: string; name: string; sku: string; price: string; stock: string };
export type MediaInput = { id: string; uploadToken: string; variantRef: string; altText: string; position: string };

function readRows(form: FormData, key: string): Record<string, unknown>[] {
  let rows: unknown;
  try { rows = JSON.parse(String(form.get(key) ?? "[]")); }
  catch { throw new Error(`Invalid ${key} data.`); }
  if (!Array.isArray(rows) || rows.length > 100 || rows.some(row => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${key} must contain no more than 100 rows.`);
  }
  return rows;
}

function rowText(row: Record<string, unknown>, key: string, max: number, required = false) {
  const value = String(row[key] ?? "").trim();
  if (required && !value) throw new Error(`${key} is required for each row.`);
  if (value.length > max) throw new Error(`${key} must be ${max} characters or fewer.`);
  return value;
}

function wholeNumber(value: string, label: string) {
  if (!/^\d+$/.test(value) || Number(value) > 2_147_483_647) {
    throw new Error(`${label} must be a non-negative whole number.`);
  }
  return Number(value);
}

export function parseProduct(form: FormData) {
  const id = String(form.get("id") ?? "");
  if (id) validateId(id);
  const categoryId = optionalText(form, "categoryId");
  if (categoryId) validateId(categoryId);
  const status = requiredText(form, "status", "Status", 20);
  if (!["draft", "active", "archived"].includes(status)) throw new Error("Choose a valid product status.");

  const attributesText = optionalText(form, "attributes");
  let attributes: unknown = null;
  if (attributesText) {
    try { attributes = JSON.parse(attributesText); }
    catch { throw new Error("Additional attributes must contain valid JSON."); }
  }

  const variants = readRows(form, "variants").map((row, index) => {
    const rowId = rowText(row, "id", 36);
    if (rowId) validateId(rowId);
    const stock = rowText(row, "stock", 10);
    return {
      id: rowId,
      clientId: rowText(row, "clientId", 80) || rowId || `variant-${index}`,
      name: rowText(row, "name", 255, true),
      sku: rowText(row, "sku", 100) || null,
      price: validatePrice(rowText(row, "price", 20, true), "Variant price"),
      stock: stock ? wholeNumber(stock, "Stock") : null,
    };
  });

  const variantRefs = variants.map(row => row.clientId);
  if (new Set(variantRefs).size !== variantRefs.length) throw new Error("A variant was included more than once.");
  const media = readRows(form, "media").map((row, index) => {
    const rowId = rowText(row, "id", 36);
    if (rowId) validateId(rowId);
    const variantRef = rowText(row, "variantRef", 80);
    if (variantRef && !variantRefs.includes(variantRef)) throw new Error("An image refers to a removed variant.");
    const uploadToken = rowText(row, "uploadToken", 2048);
    if (!rowId && !uploadToken) throw new Error("An image has not finished uploading. Please re-upload the image.");
    return {
      id: rowId,
      variantRef,
      uploadToken,
      altText: rowText(row, "altText", 255) || null,
      position: wholeNumber(rowText(row, "position", 10) || String(index), "Media position"),
    };
  });
  if (media.length > MAX_PRODUCT_IMAGES) throw new Error("Add no more than 20 images per product, including variant images.");

  for (const rows of [variants, media]) {
    const ids = rows.map(row => row.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) throw new Error("A row was included more than once.");
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
      productType: optionalText(form, "productType", 100),
      status,
      metaTitle: optionalText(form, "metaTitle", 255),
      metaDescription: optionalText(form, "metaDescription"),
      attributes,
    },
    variants,
    media,
  };
}
