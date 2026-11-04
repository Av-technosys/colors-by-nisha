"use server";

import { requireAdmin } from "@/helpers/auth/access";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs, productMedia } from "@/lib/db/schema";
import { deleteImages, imageUrl, uploadImage } from "@/helpers/storage/s3";
import { checkUploadConfiguration, createUploadReceipt, readUploadReceipt } from "@/helpers/storage/upload-receipt";

type UploadResult = { token: string; url: string; error?: never } | { error: string; token?: never; url?: never };

export async function uploadImageAction(form: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = form.get("image");
  const folder = form.get("folder");
  if (!(file instanceof File) || !file.size || (folder !== "products" && folder !== "blogs")) {
    return { error: "No image was uploaded. Please re-upload the image." };
  }
  let key = "";
  try {
    checkUploadConfiguration();
    key = await uploadImage(file, folder, folder === "blogs" ? 1024 * 1024 : undefined);
    const token = createUploadReceipt(key, folder);
    return { token, url: await imageUrl(key) };
  } catch (error) {
    if (key) await deleteImages([key]);
    const reason = error instanceof Error ? error.message : "The upload could not be completed.";
    return { error: `${reason} Please re-upload the image.` };
  }
}

export async function discardImageUploadAction(token: string, folder: "products" | "blogs") {
  await requireAdmin();
  try {
    const key = readUploadReceipt(token, folder);
    const [productImage] = await db.select({ id: productMedia.id }).from(productMedia).where(eq(productMedia.key, key)).limit(1);
    const [blogImage] = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.mainBannerImage, key)).limit(1);
    if (!productImage && !blogImage) await deleteImages([key]);
  } catch {
    // Cleanup attempt
  }
}
