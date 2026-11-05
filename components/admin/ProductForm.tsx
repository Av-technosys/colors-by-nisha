"use client";

import Link from "next/link";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/app/admin/products/actions";
import type { categories } from "@/lib/db/schema";
import type { ProductDetails } from "@/helpers/admin/products";
import { productStatuses, type MediaInput, type VariantInput } from "@/helpers/admin/product-input";
import { discardImageUploadAction } from "@/app/admin/images/actions";
import { MAX_PRODUCT_IMAGES } from "@/helpers/storage/image-limits";
import { slugify } from "@/helpers/admin/slugify";
import { PageHeading } from "./AdminUI";
import { ProductImages, type ProductImage } from "./ProductImages";

type ProductFormProps = {
  product?: ProductDetails;
  categoryOptions: (typeof categories.$inferSelect)[];
};

type SelectedImage = ProductImage & { variantRef: string };

export function ProductForm({ product, categoryOptions }: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [details, setDetails] = useState({
    name: product?.name ?? "",
    slug: product?.slug || slugify(product?.name ?? ""),
    description: product?.description ?? "",
    metaTitle: product?.metaTitle || product?.name || "",
    metaDescription: product?.metaDescription || product?.description || "",
  });

  function updateName(name: string) {
    setDetails(current => ({
      ...current,
      name,
      slug: !current.slug || current.slug === slugify(current.name) ? slugify(name) : current.slug,
      metaTitle: !current.metaTitle || current.metaTitle === current.name ? name : current.metaTitle,
    }));
  }

  function updateDescription(description: string) {
    setDetails(current => ({
      ...current,
      description,
      metaDescription: !current.metaDescription || current.metaDescription === current.description ? description : current.metaDescription,
    }));
  }
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [readingCount, setReadingCount] = useState(0);
  const [variants, setVariants] = useState<VariantInput[]>(() => product?.variants.map(row => ({
    id: row.id,
    clientId: row.id,
    name: row.name,
    sku: row.sku ?? "",
    price: row.price,
    stock: row.stock === null ? "" : String(row.stock),
    originalStock: row.stock === null ? "" : String(row.stock),
  })) ?? []);
  const [images, setImages] = useState<SelectedImage[]>(() => product?.media.map(row => ({
    id: row.id,
    clientId: row.id,
    url: row.url,
    variantRef: row.variantId ?? "",
    status: "uploaded",
  })) ?? []);
  const busy = pending || readingCount > 0;

  function imageBusy(busy: boolean) {
    setReadingCount(current => Math.max(0, current + (busy ? 1 : -1)));
  }

  function updateImages(variantRef: string, selected: ProductImage[]) {
    const updated = [...images.filter(image => image.variantRef !== variantRef), ...selected.map(image => ({ ...image, variantRef }))];
    if (updated.length > MAX_PRODUCT_IMAGES) { setError("Add no more than 20 images across this product and its variants."); return false; }
    setError(updated.some(image => image.status === "failed") ? "One or more images did not upload. Please re-upload the failed images." : "");
    setImages(updated);
    return true;
  }

  function addVariant() {
    const price = formRef.current?.querySelector<HTMLInputElement>('[name="price"]')?.value ?? "";
    setVariants(current => [...current, { id: "", clientId: crypto.randomUUID(), name: "", sku: "", price, stock: "" }]);
  }

  function updateVariant(clientId: string, field: keyof VariantInput, value: string) {
    setVariants(current => current.map(row => row.clientId === clientId ? { ...row, [field]: value } : row));
  }

  function removeVariant(clientId: string) {
    images.filter(image => image.variantRef === clientId && image.uploadToken).forEach(image => { void discardImageUploadAction(image.uploadToken!, "products"); });
    setVariants(current => current.filter(row => row.clientId !== clientId));
    setImages(current => current.filter(image => image.variantRef !== clientId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (images.some(image => image.status !== "uploaded" || (!image.id && !image.uploadToken))) {
      setError("One or more images have not uploaded. Please re-upload the images before saving.");
      return;
    }
    const form = new FormData(event.currentTarget);
    form.set("variants", JSON.stringify(variants));
    const media: MediaInput[] = [];
    for (const variantRef of ["", ...variants.map(variant => variant.clientId)]) {
      images.filter(image => image.variantRef === variantRef).forEach((image, index) => {
        media.push({ id: image.id, uploadToken: image.uploadToken ?? "", variantRef, position: String(index) });
      });
    }
    form.set("media", JSON.stringify(media));
    setError("");
    startTransition(async () => {
      try {
        const result = await saveProduct({}, form);
        setError(result.error ?? "");
      } catch {
        setError("Could not save this product. Your details are still here. Please try again.");
      }
    });
  }

  return (
    <>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-2 text-xs text-purple"><ArrowLeft size={15} aria-hidden="true" />Back to products</Link>
      <PageHeading eyebrow="Products" title={product ? "Edit product" : "Add product"} description="Add the main product, its variants, and the details customers need." />
      <form ref={formRef} onSubmit={handleSubmit} className="min-w-0 [&_label]:min-w-0 [&_input]:min-w-0 [&_select]:min-w-0 [&_textarea]:min-w-0">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <fieldset disabled={pending} className="min-w-0 space-y-6 disabled:opacity-60">
          <section className="rounded-md border border-[#e8e5df] bg-white p-5 sm:p-7">
            <h2 className="mb-6 font-display text-xl">Main product</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs text-neutral-500 sm:col-span-2">
                Product name
                <input name="name" required maxLength={255} value={details.name} onChange={event => updateName(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" />
              </label>
              <label className="text-xs text-neutral-500">
                Slug
                <input name="slug" required maxLength={255} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="noori-lehenga" value={details.slug} onChange={event => setDetails(current => ({ ...current, slug: event.target.value }))} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" />
              </label>
              <label className="text-xs text-neutral-500">
                SKU
                <input name="sku" maxLength={100} defaultValue={product?.sku ?? ""} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" />
              </label>
              <div className="grid gap-5 sm:col-span-2 md:grid-cols-3">
                <label className="text-xs text-neutral-500">
                  Price (₹)
                  <input name="price" type="number" min="0" max="99999999.99" step="0.01" required defaultValue={product?.price} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" />
                </label>
                <label className="text-xs text-neutral-500">
                  Category
                  <select name="categoryId" defaultValue={product?.categoryId ?? ""} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-sm"><option value="">Uncategorised</option>{categoryOptions.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                </label>
                <label className="text-xs text-neutral-500">
                  Status
                  <select name="status" defaultValue={product?.status ?? "draft"} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-sm">{productStatuses.map(status => <option key={status} value={status}>{status === "out_of_stock" ? "Out of stock" : status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>
                </label>
              </div>
              <label className="text-xs text-neutral-500 sm:col-span-2">
                Short description
                <textarea name="shortDescription" rows={3} defaultValue={product?.shortDescription ?? ""} className="mt-2 w-full rounded-md border border-[#e5e1da] p-3 text-sm" />
              </label>
              <label className="text-xs text-neutral-500 sm:col-span-2">
                Description
                <textarea name="description" rows={5} value={details.description} onChange={event => updateDescription(event.target.value)} className="mt-2 w-full rounded-md border border-[#e5e1da] p-3 text-sm" />
              </label>
            </div>
            <div className="mt-7 border-t border-[#eeeae4] pt-6">
              <h3 className="mb-2 font-display text-lg">Product images</h3>
              <p className="mb-4 text-xs text-neutral-400">The first image is the main product image. Use the arrows to change the order.</p>
              <ProductImages images={images.filter(image => !image.variantRef)} onChange={selected => updateImages("", selected)} onBusyChange={imageBusy} disabled={busy} />
            </div>
          </section>

          <section className="rounded-md border border-[#e8e5df] bg-white p-5 sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-display text-xl">Variants</h2><p className="mt-1 text-xs text-neutral-400">Add sizes or other options, each with its own images.</p></div>
              <button type="button" disabled={busy} onClick={addVariant} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#e5e1da] px-3 text-xs text-purple"><Plus size={15} />Add variant</button>
            </div>
            {!variants.length && <p className="rounded-md bg-[#f9f8f5] p-5 text-xs text-neutral-400">No variants added.</p>}
            <div className="space-y-5">
              {variants.map((variant, index) => (
                <div key={variant.clientId} className="rounded-md border border-[#e5e1da] p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between"><h3 className="font-display text-base">Variant {index + 1}</h3><button type="button" disabled={busy} onClick={() => removeVariant(variant.clientId)} aria-label={`Remove variant ${index + 1}`} className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs text-[#a16b60] hover:bg-[#f7eeec]"><Trash2 size={15} />Remove</button></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-xs text-neutral-500">Variant name<input required maxLength={255} value={variant.name} onChange={event => updateVariant(variant.clientId, "name", event.target.value)} placeholder="e.g. Small / Ivory" className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" /></label>
                    <label className="text-xs text-neutral-500">SKU<input maxLength={100} value={variant.sku} onChange={event => updateVariant(variant.clientId, "sku", event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" /></label>
                    <label className="text-xs text-neutral-500">Price (₹)<input required type="number" min="0" max="99999999.99" step="0.01" value={variant.price} onChange={event => updateVariant(variant.clientId, "price", event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" /></label>
                    <label className="text-xs text-neutral-500">Stock<input type="number" min="0" max="2147483647" step="1" value={variant.stock} onChange={event => updateVariant(variant.clientId, "stock", event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" /><span className="mt-2 block text-[10px] text-neutral-400">Leave blank if stock is not tracked.</span></label>
                  </div>
                  <div className="mt-6 border-t border-[#eeeae4] pt-5">
                    <h4 className="mb-4 font-display text-base">Variant images</h4>
                    <ProductImages images={images.filter(image => image.variantRef === variant.clientId)} onChange={selected => updateImages(variant.clientId, selected)} onBusyChange={imageBusy} disabled={busy} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[#e8e5df] bg-white p-5 sm:p-7">
            <h2 className="mb-6 font-display text-xl">Search information</h2>
            <div className="space-y-5">
              <label className="block text-xs text-neutral-500">Meta title<input name="metaTitle" maxLength={255} value={details.metaTitle} onChange={event => setDetails(current => ({ ...current, metaTitle: event.target.value }))} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm" /></label>
              <label className="block text-xs text-neutral-500">Meta description<textarea name="metaDescription" rows={3} value={details.metaDescription} onChange={event => setDetails(current => ({ ...current, metaDescription: event.target.value }))} className="mt-2 w-full rounded-md border border-[#e5e1da] p-3 text-sm" /></label>
            </div>
          </section>

          {error && <p role="alert" className="rounded-md bg-[#f7eeec] p-4 text-sm text-[#a16b60]">{error}</p>}
          <div className="flex flex-wrap items-center justify-end gap-3 pb-4">
            {pending && <p role="status" className="mr-auto text-xs text-neutral-500">Saving product…</p>}
            <Link href="/admin/products" className="inline-flex min-h-11 items-center px-4 text-sm text-neutral-500">Cancel</Link>
            <button type="submit" disabled={busy} className="min-h-11 rounded-md bg-purple px-5 font-display text-sm text-white disabled:opacity-50">{pending ? "Saving…" : readingCount ? "Uploading images…" : "Save product"}</button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
