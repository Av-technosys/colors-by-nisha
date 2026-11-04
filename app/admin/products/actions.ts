"use server";

import { requireAdmin } from "@/helpers/auth/access";

import { readCatalog } from "@/helpers/admin/catalog";
import { getProductList } from "@/helpers/admin/products";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { categories, products, productMedia, productVariants } from "@/lib/db/schema";
import { confirmImageUpload, deleteImages } from "@/helpers/storage/s3";
import { readUploadReceipt } from "@/helpers/storage/upload-receipt";
import { parseProduct } from "@/helpers/admin/product-input";
import { actionError, validateId, type ActionState } from "@/helpers/admin/validation";
import { slugify } from "@/helpers/admin/slugify";

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
    console.error("saveProduct failed:", error);
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
    console.error("deleteProduct failed:", error);
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

// ----------------- Robust CSV Parser & Smart Product Upload -----------------

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\r") {
        if (next === "\n") i++;
        row.push(cell.trim());
        if (row.some(c => c.length > 0)) rows.push(row);
        row = [];
        cell = "";
      } else if (char === "\n") {
        row.push(cell.trim());
        if (row.some(c => c.length > 0)) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c.length > 0)) rows.push(row);
  }
  return rows;
}

function getValExact(row: Record<string, string>, targets: string[]): string {
  const keys = Object.keys(row);
  for (const target of targets) {
    const tClean = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const key of keys) {
      const kClean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (kClean === tClean) {
        const val = row[key]?.trim();
        if (val) return val;
      }
    }
  }
  return "";
}

function cleanContinuousParagraph(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSpecsFromRow(row: Record<string, string>): Record<string, string> {
  const specs: Record<string, string> = {};
  const find = (keys: string[]) => getValExact(row, keys);

  const numComp = find(["no. of components", "no of components", "number of components", "components count"]);
  if (numComp) specs["No. of Components"] = numComp;

  const comps = find(["components", "component", "package contains", "contents", "set contains"]);
  if (comps) specs["Components"] = comps;

  const features = find(["noteworthy features", "noteworthy feature", "features", "highlights", "key features"]);
  if (features) specs["Noteworthy Features"] = features;

  const occasion = find(["occasion", "occasions", "event"]);
  if (occasion) specs["Occasion"] = occasion;

  const style = find(["style", "fashion style"]);
  if (style) specs["Style"] = style;

  const pattern = find(["pattern", "print", "prints & pattern"]);
  if (pattern) specs["Pattern"] = pattern;

  const work = find(["type of work", "work", "work type", "embroidery", "craft", "embellishment"]);
  if (work) specs["Type of Work"] = work;

  const fabric = find(["fabric", "fabric details", "material"]);
  if (fabric) specs["Fabric"] = fabric;

  const colour = find(["colour", "color", "shade"]);
  if (colour) specs["Colour"] = colour;

  return specs;
}

function generateProductShortDescription(
  category: "Lehenga" | "Saree" | "Ethnic",
  name: string,
  description: string,
  rowSpecs: Record<string, string> = {}
): string {
  const descLower = `${name} ${description}`.toLowerCase();
  const specs: Record<string, string> = { ...rowSpecs };

  // 1. Components & No. of Components
  if (!specs["Components"]) {
    if (category === "Saree") {
      specs["No. of Components"] = "2";
      specs["Components"] = "Saree, Blouse";
    } else if (category === "Lehenga") {
      if (descLower.includes("panel") || descLower.includes("kurta") || descLower.includes("jacket")) {
        specs["No. of Components"] = "4";
        specs["Components"] = "Lehenga, Blouse, Dupatta, Embellished Panel";
      } else {
        specs["No. of Components"] = "3";
        specs["Components"] = "Lehenga, Blouse, Dupatta";
      }
    } else {
      if (descLower.includes("dupatta") || descLower.includes("pant")) {
        specs["No. of Components"] = "3";
        specs["Components"] = "Kurta, Pants, Dupatta";
      } else if (descLower.includes("jacket")) {
        specs["No. of Components"] = "2";
        specs["Components"] = "Kurta, Jacket";
      } else {
        specs["No. of Components"] = "2";
        specs["Components"] = "Kurta, Pants";
      }
    }
  } else if (!specs["No. of Components"]) {
    const count = specs["Components"].split(/[,&]+/).length;
    specs["No. of Components"] = String(count);
  }

  // 2. Noteworthy Features
  if (!specs["Noteworthy Features"]) {
    const features: string[] = [];
    if (descLower.includes("kanchali")) features.push("Multi-colour Kanchali-style blouse");
    else if (descLower.includes("statement blouse") || descLower.includes("embellished blouse")) features.push("Exquisitely embellished statement blouse");

    if (descLower.includes("shreenath") || descLower.includes("pichwai")) features.push("Statement Shreenath Ji panel with sacred Pichwai art motifs");
    else if (descLower.includes("vrindavan")) features.push("Intricate Vrindavan-inspired scenic artwork");
    else if (descLower.includes("cloud") || descLower.includes("azure")) features.push("Digitally illustrated cloud motifs with dreamlike aesthetic");
    else if (descLower.includes("patch") || descLower.includes("multi-colour")) features.push("Intricate multi-colour patches with detailed craftsmanship");

    if (descLower.includes("kardana")) features.push("Kardana sequin work and semi-precious stone embellishments");
    else if (descLower.includes("zardozi") && descLower.includes("pearl")) features.push("Refined mix of Zardozi and pearl work");
    else if (descLower.includes("zardozi") && descLower.includes("marodi")) features.push("Detailed Zardozi and Marodi work");
    else if (descLower.includes("pearl tassel")) features.push("Delicate pearl tassels on sleeves");
    else if (descLower.includes("beadwork") || descLower.includes("bridal")) features.push("Luxurious bridal beadwork and shimmering sequin detailing");

    if (features.length === 0) {
      features.push(category === "Saree" ? "Statement blouse with handcrafted embellishments" : "Signature silhouette with fine artisanal detailing");
    }
    specs["Noteworthy Features"] = features.join(", ");
  }

  // 3. Occasion
  if (!specs["Occasion"]) {
    if (descLower.includes("wedding") || descLower.includes("bride") || descLower.includes("bridal") || descLower.includes("reception")) {
      specs["Occasion"] = "Weddings, Receptions, Festive Celebrations & Special Occasions";
    } else if (category === "Lehenga") {
      specs["Occasion"] = "Weddings, Sangeet, Festive Celebrations & Special Occasions";
    } else if (category === "Saree") {
      specs["Occasion"] = "Weddings, Festive Celebrations, Sangeet & Special Occasions";
    } else {
      specs["Occasion"] = "Festive Celebrations, Family Gatherings & Special Occasions";
    }
  }

  // 4. Style
  if (!specs["Style"]) {
    if (descLower.includes("whimsical")) specs["Style"] = "Contemporary Indian | Whimsical";
    else if (descLower.includes("couture") || descLower.includes("heritage")) specs["Style"] = "Heritage Indian Couture | Festive";
    else specs["Style"] = "Contemporary Indian | Festive";
  }

  // 5. Pattern
  if (!specs["Pattern"]) {
    if (descLower.includes("pichwai")) specs["Pattern"] = "Pichwai Art Inspired | Digital Print";
    else if (descLower.includes("scenic") || descLower.includes("vrindavan")) specs["Pattern"] = "Scenic Artwork | Embellished";
    else if (descLower.includes("cloud") || descLower.includes("illustrated")) specs["Pattern"] = "Digitally Illustrated Scenic Motifs";
    else if (descLower.includes("digital printed") || descLower.includes("printed")) specs["Pattern"] = "Digital Printed";
    else if (descLower.includes("motif") || descLower.includes("floral")) specs["Pattern"] = "Floral Motifs | Embellished";
    else specs["Pattern"] = "Embellished";
  }

  // 6. Type of Work
  if (!specs["Type of Work"]) {
    if (descLower.includes("kardana") && descLower.includes("stone")) specs["Type of Work"] = "Kardana Sequin & Semi-Precious Stone Work";
    else if (descLower.includes("zardozi") && descLower.includes("marodi")) specs["Type of Work"] = "Zardozi & Marodi Work";
    else if (descLower.includes("zardozi") && descLower.includes("pearl")) specs["Type of Work"] = "Zardozi & Pearl Work";
    else if (descLower.includes("3d pearl") || descLower.includes("pearl work")) specs["Type of Work"] = "3D Pearl Work & Sequin Embellishments";
    else if (descLower.includes("beadwork") || descLower.includes("bridal beadwork")) specs["Type of Work"] = "Bridal Beadwork & Sequin Embellishments";
    else if (descLower.includes("sequin")) specs["Type of Work"] = "Sequin & Hand Embroidery";
    else specs["Type of Work"] = "Hand Embellished Artisanal Work";
  }

  // 7. Fabric
  if (!specs["Fabric"]) {
    const fabrics: string[] = [];
    if (descLower.includes("cora silk") || descLower.includes("cora")) fabrics.push("Pure Cora Silk");
    else if (descLower.includes("silk") && descLower.includes("satin")) fabrics.push("Silk Satin");
    else if (descLower.includes("satin")) fabrics.push("Satin");
    else if (descLower.includes("silk")) fabrics.push("Silk");

    if (descLower.includes("organza")) fabrics.push("Organza");
    if (descLower.includes("georgette")) fabrics.push("Georgette");
    if (descLower.includes("chiffon")) fabrics.push("Chiffon");

    if (fabrics.length === 0) {
      specs["Fabric"] = category === "Saree" ? "Satin" : (category === "Lehenga" ? "Silk, Organza" : "Pure Silk Blend");
    } else {
      specs["Fabric"] = fabrics.join(", ");
    }
  }

  // 8. Colour
  if (!specs["Colour"]) {
    if (descLower.includes("gulabi") || descLower.includes("vibrant pink") || descLower.includes("pink")) specs["Colour"] = "Pink";
    else if (descLower.includes("azure") || descLower.includes("blue")) specs["Colour"] = "Azure Blue";
    else if (descLower.includes("mint") && descLower.includes("ivory")) specs["Colour"] = "Mint & Ivory";
    else if (descLower.includes("mint")) specs["Colour"] = "Mint Green";
    else if (descLower.includes("yellow") || descLower.includes("haldi")) specs["Colour"] = "Mustard Yellow";
    else if (descLower.includes("red") || descLower.includes("crimson")) specs["Colour"] = "Crimson Red";
    else if (descLower.includes("green") || descLower.includes("emerald")) specs["Colour"] = "Emerald Green";
    else if (descLower.includes("multi-colour") || descLower.includes("multicolor") || descLower.includes("multi colour")) specs["Colour"] = "Multi-colour";
    else specs["Colour"] = "Multi-colour";
  }

  const fieldOrder = [
    "No. of Components",
    "Components",
    "Noteworthy Features",
    "Occasion",
    "Style",
    "Pattern",
    "Type of Work",
    "Fabric",
    "Colour",
  ];

  return fieldOrder.map(k => `• ${k}: ${specs[k]}`).join("\n");
}

function resolveCleanCategory(categoryStr: string, typeStr: string, tagsStr: string, name: string, desc: string): "Lehenga" | "Saree" | "Ethnic" {
  const allText = `${typeStr} ${tagsStr} ${name} ${desc}`.toLowerCase();

  // 1. Direct type check
  const typeLower = (typeStr || "").toLowerCase().trim();
  if (typeLower === "lehenga" || typeLower === "lehengas" || typeLower === "lehnga") return "Lehenga";
  if (typeLower === "saree" || typeLower === "sarees" || typeLower === "sari" || typeLower === "saris") return "Saree";
  if (typeLower.includes("ethnic") || typeLower.includes("suit") || typeLower.includes("kurti") || typeLower.includes("anarkali")) return "Ethnic";

  // 2. Leaf check from category string (after last '>')
  const catParts = (categoryStr || "").split(">");
  const lastPart = catParts[catParts.length - 1].toLowerCase().trim();
  if (lastPart === "lehengas" || lastPart === "lehenga") return "Lehenga";
  if (lastPart === "saris" || lastPart === "saree" || lastPart === "sarees" || lastPart === "sari") return "Saree";
  if (lastPart === "kurtas" || lastPart === "kurti" || lastPart === "suits" || lastPart === "ethnic") return "Ethnic";

  // 3. Name & Description keywords
  if (allText.includes("kurta") || allText.includes("pant") || allText.includes("suit") || allText.includes("anarkali") || allText.includes("cora silk") || allText.includes("ethnic") || allText.includes("muse")) return "Ethnic";
  if (allText.includes("saree") || allText.includes("sari")) return "Saree";
  if (allText.includes("lehenga") || allText.includes("lehnga") || allText.includes("skirt")) return "Lehenga";

  // 4. Fallback from category string
  const catLower = (categoryStr || "").toLowerCase();
  if (catLower.includes("lehenga") || catLower.includes("lehnga")) return "Lehenga";
  if (catLower.includes("sari") || catLower.includes("saree")) return "Saree";

  return "Ethnic";
}

type ParsedProductGroup = {
  handle: string;
  name: string;
  price: string;
  category: "Lehenga" | "Saree" | "Ethnic";
  rawCategory: string;
  type: string;
  tags: string;
  shortDescription: string;
  description: string;
  status: string;
  images: string[];
  variants: {
    name: string;
    price: string;
    sku?: string;
    stock?: number | null;
  }[];
};

export async function uploadProductsCsv(formData: FormData): Promise<{ count?: number; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file || !file.size) {
      return { error: "Please select a valid CSV file." };
    }

    const text = await file.text();
    const rows = parseCsvRows(text);
    if (rows.length < 2) {
      return { error: "CSV file is empty or missing data rows." };
    }

    const headers = rows[0].map(h => h.trim());

    // 1. Fetch categories from DB
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map<string, string>();
    for (const cat of allCategories) {
      categoryMap.set(cat.name.toLowerCase().trim(), cat.id);
      categoryMap.set(cat.slug.toLowerCase().trim(), cat.id);
      categoryMap.set(cat.id.toLowerCase().trim(), cat.id);
    }

    // 2. Fetch existing products for SKU counter and update detection
    const existingProducts = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
    }).from(products);

    const existingSlugs = new Set(existingProducts.map(p => p.slug.toLowerCase()));
    const productBySlug = new Map(existingProducts.map(p => [p.slug.toLowerCase(), p.id]));
    const productByName = new Map(existingProducts.map(p => [p.name.toLowerCase().trim(), p.id]));
    const productBySku = new Map(existingProducts.filter(p => p.sku).map(p => [p.id, p.sku!]));

    // 3. Initialize SKU sequence counters based on existing database SKUs
    const skuCounters = new Map<string, number>();
    for (const p of existingProducts) {
      if (!p.sku) continue;
      const match = p.sku.toUpperCase().match(/^([A-Z]+)-(\d+)$/);
      if (match) {
        const prefix = match[1];
        const num = parseInt(match[2], 10);
        const currentMax = skuCounters.get(prefix) || 0;
        if (num > currentMax) skuCounters.set(prefix, num);
      }
    }

    function getNextSku(prefix: string): string {
      const current = skuCounters.get(prefix) || 0;
      const next = current + 1;
      skuCounters.set(prefix, next);
      return `${prefix}-${String(next).padStart(3, "0")}`;
    }

    // 4. GROUP ROWS BY PRODUCT (Handle or Title)
    const productGroups = new Map<string, ParsedProductGroup>();
    let lastHandle = "";

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || "";
      });

      // Handle & Title extraction
      let handle = getValExact(row, ["handle", "slug", "product handle", "url"]);
      const title = getValExact(row, ["title", "product name", "name", "product_name"]);
      const bodyHtml = getValExact(row, ["body (html)", "body html", "description", "details"]);
      const typeStr = getValExact(row, ["type", "product type"]);
      const tagsStr = getValExact(row, ["tags"]);
      const catStr = getValExact(row, ["product category", "category", "categories"]);
      const rawPrice = getValExact(row, ["variant price", "price", "regular price", "mrp", "amount", "cost"]);
      const rawImage = getValExact(row, ["image src", "image", "image url", "images", "img", "photo", "picture", "image link"]);
      const opt1Val = getValExact(row, ["option1 value"]);
      const variantSku = getValExact(row, ["variant sku", "sku"]);
      const variantStock = getValExact(row, ["variant inventory qty", "inventory qty", "stock", "quantity"]);
      const published = getValExact(row, ["published", "status"]).toLowerCase();

      // Skip rogue rows with no handle and no title
      if (!handle && !title) {
        if (lastHandle && productGroups.has(lastHandle)) {
          handle = lastHandle;
        } else {
          continue;
        }
      }

      if (!handle) {
        handle = slugify(title);
      }
      lastHandle = handle;

      const groupKey = handle.toLowerCase();
      let group = productGroups.get(groupKey);

      if (!group) {
        // Resolve clean category: Lehenga / Saree / Ethnic
        const cleanCat = resolveCleanCategory(catStr, typeStr, tagsStr, title, bodyHtml);

        // Clean narrative paragraph (continuous text)
        const continuousDescription = cleanContinuousParagraph(bodyHtml);

        // Extract any specs provided in CSV row columns
        const rowSpecs = extractSpecsFromRow(row);

        // Generate tailored 9-point short description (. No. of Components: 2...)
        const shortDescription = generateProductShortDescription(cleanCat, title || handle, continuousDescription, rowSpecs);

        const priceNum = parseFloat(rawPrice.replace(/[^0-9.]/g, "") || "0");
        const price = !isNaN(priceNum) && priceNum > 0 ? priceNum.toFixed(2) : "0.00";

        let status = "active";
        if (published === "false" || published === "draft") status = "draft";

        group = {
          handle,
          name: title || handle,
          price,
          category: cleanCat,
          rawCategory: catStr,
          type: typeStr,
          tags: tagsStr,
          shortDescription,
          description: continuousDescription,
          status,
          images: [],
          variants: [],
        };
        productGroups.set(groupKey, group);
      }

      // Add image if present
      if (rawImage) {
        const urls = rawImage.split(/[,;\n|]+/).map(u => u.trim()).filter(Boolean);
        for (const u of urls) {
          if (!group.images.includes(u)) {
            group.images.push(u);
          }
        }
      }

      // Add variant if present
      const variantName = opt1Val && opt1Val !== "Default Title" ? opt1Val : "Standard";
      const vPriceNum = parseFloat(rawPrice.replace(/[^0-9.]/g, "") || group.price);
      const vPrice = !isNaN(vPriceNum) && vPriceNum > 0 ? vPriceNum.toFixed(2) : group.price;
      // Unlimited in-stock (stock = null, no artificial limit)
      const vStock = null;

      // Avoid duplicate variants with same name
      if (!group.variants.some(v => v.name === variantName)) {
        group.variants.push({
          name: variantName,
          price: vPrice,
          sku: variantSku || undefined,
          stock: vStock,
        });
      }
    }

    if (productGroups.size === 0) {
      return { error: "No valid products found in the CSV." };
    }

    let processedCount = 0;

    await db.transaction(async tx => {
      for (const group of productGroups.values()) {
        const name = group.name.trim();
        if (!name || name.toLowerCase() === "title" || name.toLowerCase() === "default title") continue;

        // Resolve category UUID
        const cleanCategory = group.category;
        let categoryId = categoryMap.get(cleanCategory.toLowerCase()) || null;
        if (!categoryId) {
          const [newCat] = await tx.insert(categories).values({
            name: cleanCategory,
            slug: slugify(cleanCategory),
          }).returning({ id: categories.id });
          categoryId = newCat.id;
          categoryMap.set(cleanCategory.toLowerCase(), newCat.id);
        }

        // Check if product already exists
        const baseSlug = slugify(group.handle || name);
        const existingId = productByName.get(name.toLowerCase()) || productBySlug.get(baseSlug.toLowerCase());

        // Sequential SKU: SAR-001, LHN-001, ETH-001
        const prefix = cleanCategory === "Saree" ? "SAR" : (cleanCategory === "Lehenga" ? "LHN" : "ETH");
        let finalSku = existingId && productBySku.has(existingId) ? productBySku.get(existingId)! : getNextSku(prefix);

        let productId = existingId;

        if (existingId) {
          // UPDATE EXISTING PRODUCT
          await tx.update(products).set({
            name,
            price: group.price,
            sku: finalSku,
            categoryId,
            shortDescription: group.shortDescription || null,
            description: group.description || null,
            status: group.status,
            metaTitle: `${name} | Colors by Nisha`,
            metaDescription: group.shortDescription || group.description || null,
            updatedAt: new Date(),
          }).where(eq(products.id, existingId));
        } else {
          // INSERT NEW PRODUCT
          let finalSlug = baseSlug;
          let counter = 1;
          while (existingSlugs.has(finalSlug.toLowerCase())) {
            finalSlug = `${baseSlug}-${counter++}`;
          }
          existingSlugs.add(finalSlug.toLowerCase());

          const [created] = await tx.insert(products).values({
            name,
            slug: finalSlug,
            sku: finalSku,
            price: group.price,
            categoryId,
            shortDescription: group.shortDescription || null,
            description: group.description || null,
            status: group.status,
            metaTitle: `${name} | Colors by Nisha`,
            metaDescription: group.shortDescription || group.description || null,
          }).returning({ id: products.id });
          productId = created.id;
        }

        // Manage Images in product_media
        if (productId && group.images.length > 0) {
          await tx.delete(productMedia).where(eq(productMedia.productId, productId));
          for (let imgIdx = 0; imgIdx < group.images.length; imgIdx++) {
            await tx.insert(productMedia).values({
              productId,
              key: group.images[imgIdx],
              position: imgIdx,
            });
          }
        }

        // Manage Variants in product_variants
        if (productId) {
          await tx.delete(productVariants).where(eq(productVariants.productId, productId));
          const variantsToInsert = group.variants.length > 0 ? group.variants : [{ name: "Standard", price: group.price, stock: null }];

          for (let vIdx = 0; vIdx < variantsToInsert.length; vIdx++) {
            const v = variantsToInsert[vIdx];
            const variantSku = v.name === "Standard" ? finalSku : `${finalSku}-${v.name.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
            await tx.insert(productVariants).values({
              productId,
              name: v.name,
              sku: variantSku,
              price: v.price,
              stock: null,
            });
          }
        }

        processedCount++;
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    revalidatePath("/products/[handle]", "page");

    return { count: processedCount };
  } catch (error) {
    console.error("uploadProductsCsv error:", error);
    return { error: actionError(error) };
  }
}
