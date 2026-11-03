"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { discardImageUploadAction, uploadImageAction } from "@/app/admin/images/actions";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/helpers/storage/image-limits";

export type ProductImage = {
  id: string;
  clientId: string;
  url: string;
  file?: File;
  uploadToken?: string;
  status: "uploading" | "uploaded" | "failed";
  error?: string;
};

type ProductImagesProps = {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => boolean | void;
  onBusyChange: (busy: boolean) => void;
  disabled: boolean;
};

export function ProductImages({ images, onChange, onBusyChange, disabled }: ProductImagesProps) {
  const inputId = useId();
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const urls = useRef(new Set<string>());
  const mounted = useRef(true);
  const currentImages = useRef(images);
  useEffect(() => { currentImages.current = images; }, [images]);

  function commit(next: ProductImage[]) {
    const accepted = onChange(next);
    if (accepted !== false) currentImages.current = next;
    return accepted;
  }

  async function upload(image: ProductImage) {
    if (!image.file) return;
    if (image.uploadToken) void discardImageUploadAction(image.uploadToken, "products");
    commit(currentImages.current.map(item => item.clientId === image.clientId ? { ...image, status: "uploading", uploadToken: "", error: "" } : item));
    try {
      const form = new FormData();
      form.set("image", image.file);
      form.set("folder", "products");
      const result = await uploadImageAction(form);
      if (result.error || !result.token) throw new Error(result.error || "Upload failed. Please re-upload the image.");
      if (!mounted.current) { void discardImageUploadAction(result.token, "products"); return; }
      commit(currentImages.current.map(item => item.clientId === image.clientId ? { ...item, url: result.url, uploadToken: result.token, status: "uploaded", file: undefined, error: "" } : item));
    } catch (error) {
      if (mounted.current) commit(currentImages.current.map(item => item.clientId === image.clientId ? { ...item, status: "failed", error: error instanceof Error ? error.message : "Upload failed. Please re-upload the image." } : item));
    }
  }

  async function reupload(image: ProductImage, file?: File) {
    const selected = file ?? image.file;
    if (!selected || reading) return;
    if (!IMAGE_TYPES.includes(selected.type) || !selected.size || selected.size > MAX_IMAGE_BYTES) {
      setError("Choose a supported image of 5 MB or less, then re-upload the image.");
      return;
    }
    setReading(true);
    onBusyChange(true);
    const url = URL.createObjectURL(selected);
    urls.current.add(url);
    try {
      const preview = new window.Image();
      preview.src = url;
      await preview.decode();
      await upload({ ...image, file: selected, url });
    } catch {
      setError("This file could not be opened. Please re-upload the image.");
    } finally {
      if (mounted.current) { setReading(false); onBusyChange(false); }
    }
  }

  useEffect(() => {
    mounted.current = true;
    const previews = urls.current;
    return () => {
      mounted.current = false;
      previews.forEach(url => URL.revokeObjectURL(url));
      previews.clear();
    };
  }, []);

  async function selectFiles(files: File[]) {
    if (!files.length || reading) return;
    if (files.length + images.length > MAX_PRODUCT_IMAGES) {
      setError("Choose no more than 20 images per product, including variant images.");
      return;
    }
    setError("");
    setReading(true);
    onBusyChange(true);
    const added: ProductImage[] = [];
    try {
      for (const file of files) {
        if (!IMAGE_TYPES.includes(file.type) || !file.size || file.size > MAX_IMAGE_BYTES) {
          throw new Error("Choose JPG, PNG, WebP, or GIF images of 5 MB or less.");
        }
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        const preview = new window.Image();
        preview.src = url;
        try { await preview.decode(); }
        catch {
          URL.revokeObjectURL(url);
          urls.current.delete(url);
          throw new Error(`“${file.name}” could not be opened as an image.`);
        }
        if (!mounted.current) return;
        added.push({ id: "", clientId: crypto.randomUUID(), url, file, status: "uploading" });
      }
      if (mounted.current && commit([...currentImages.current, ...added]) === false) {
        added.forEach(image => { URL.revokeObjectURL(image.url); urls.current.delete(image.url); });
        return;
      }
      for (const image of added) await upload(image);
    } catch (error) {
      added.forEach(image => { URL.revokeObjectURL(image.url); urls.current.delete(image.url); });
      if (mounted.current) setError(error instanceof Error ? error.message : "The images could not be opened.");
    } finally {
      if (mounted.current) {
        setReading(false);
        onBusyChange(false);
      }
    }
  }

  function move(index: number, direction: number) {
    const ordered = [...images];
    [ordered[index], ordered[index + direction]] = [ordered[index + direction], ordered[index]];
    commit(ordered);
  }

  function remove(index: number) {
    const image = images[index];
    if (urls.current.has(image.url)) {
      URL.revokeObjectURL(image.url);
      urls.current.delete(image.url);
    }
    if (image.uploadToken) void discardImageUploadAction(image.uploadToken, "products");
    commit(images.filter((_, imageIndex) => imageIndex !== index));
  }

  return (
    <div className="space-y-4">
      <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-[#d9d2e2] bg-[#faf9fc] px-5 py-7 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-[#eee8f4] text-purple"><ImagePlus size={21} aria-hidden="true" /></span>
        <span className="font-display text-sm text-purple">{reading ? "Uploading images…" : "Choose images"}</span>
        <span className="text-[11px] text-neutral-400">JPG, PNG, WebP, or GIF · up to 5 MB each</span>
        <input id={inputId} type="file" accept={IMAGE_TYPES.join(",")} multiple disabled={disabled || reading} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void selectFiles(files); }} className="sr-only" />
      </label>
      {error && <p role="alert" className="text-xs text-[#a16b60]">{error}</p>}
      {!!images.length && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image, index) => (
          <div key={image.clientId} className="overflow-hidden rounded-lg border border-[#e5e1da] bg-white">
            <div className="relative aspect-4/3 bg-[#f7f6f3]">
              <Image src={image.url} alt={`Product image ${index + 1}`} fill unoptimized className="object-contain" onError={() => {
                if (image.status === "uploaded") commit(currentImages.current.map(item => item.clientId === image.clientId ? { ...item, status: "failed", error: "The image could not be loaded. Please re-upload the image." } : item));
              }} />
              {image.status === "uploading" && <div role="status" className="absolute inset-0 flex items-center justify-center gap-2 bg-white/75 text-xs text-purple"><LoaderCircle size={17} className="motion-safe:animate-spin" />Uploading…</div>}
              {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-purple px-2 py-1 text-[9px] text-white">Cover image</span>}
              <button type="button" disabled={disabled || reading} onClick={() => remove(index)} aria-label={`Remove image ${index + 1}`} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white text-[#a16b60] shadow-sm"><Trash2 size={15} aria-hidden="true" /></button>
            </div>
            <div className="space-y-3 p-3">
              {image.status === "uploaded" && <p role="status" className="text-[10px] text-[#517254]">Uploaded</p>}
              {image.status === "failed" && <div className="space-y-2">
                <p role="alert" className="text-[11px] text-[#a16b60]">{image.error || "Image upload failed. Please re-upload the image."}</p>
                {image.file ? <button type="button" disabled={disabled || reading} onClick={() => void reupload(image)} className="inline-flex min-h-9 items-center gap-2 text-xs text-purple"><RefreshCw size={13} />Re-upload image</button> : <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-purple"><RefreshCw size={13} />Re-upload image<input type="file" accept={IMAGE_TYPES.join(",")} disabled={disabled || reading} className="sr-only" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void reupload(image, file); }} /></label>}
              </div>}
              <div className="flex items-center justify-between"><span className="sr-only">Image {index + 1}</span><div className="flex gap-1"><button type="button" disabled={disabled || reading || index === 0} onClick={() => move(index, -1)} aria-label={`Move image ${index + 1} earlier`} className="grid size-8 place-items-center rounded-md border border-[#e5e1da] text-purple disabled:opacity-30"><ChevronLeft size={13} /></button><button type="button" disabled={disabled || reading || index === images.length - 1} onClick={() => move(index, 1)} aria-label={`Move image ${index + 1} later`} className="grid size-8 place-items-center rounded-md border border-[#e5e1da] text-purple disabled:opacity-30"><ChevronRight size={13} /></button></div></div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
