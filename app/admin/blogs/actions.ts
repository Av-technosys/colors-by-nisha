"use server";

import { readCatalog } from "@/helpers/admin/catalog";
import { getBlogList } from "@/helpers/admin/blogs";
import { getCategories } from "@/helpers/admin/categories";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { blogs, categories } from "@/lib/db/schema";
import { confirmImageUpload, deleteImages } from "@/helpers/storage/s3";
import { MAX_BLOG_CONTENT_LENGTH, getBlogContentText } from "@/helpers/admin/blog-content";
import { sanitizeBlogContent } from "@/helpers/admin/blog-content.server";
import { actionError, validateId, type ActionState } from "@/helpers/admin/validation";
import { readUploadReceipt } from "@/helpers/storage/upload-receipt";
import { validateBlogFields, type BlogFields, type MutationResult } from "@/components/admin/blogs/blog-fields";

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function saveBlogAction(form: FormData): Promise<MutationResult<{ id: string }>> {
  const id = text(form, "id");
  const uploadToken = text(form, "imageUploadToken");
  const keepImage = text(form, "keepImage") === "true";
  const fields: BlogFields = {
    title: text(form, "title"), slug: text(form, "slug"), categoryId: text(form, "categoryId"),
    publishDate: text(form, "publishDate"), authorName: text(form, "authorName"),
    metaTitle: text(form, "metaTitle"), metaDescription: text(form, "metaDescription"),
    content: text(form, "content"), isDraft: text(form, "isDraft") === "true",
    mainBannerImage: uploadToken ? "uploaded" : id && keepImage ? "existing" : "",
  };
  const errors = validateBlogFields(fields);
  if (Object.keys(errors).length) return { success: false, message: "Please check the highlighted fields.", errors };
  fields.content = sanitizeBlogContent(fields.content);
  if (!getBlogContentText(fields.content) || fields.content.length > MAX_BLOG_CONTENT_LENGTH) {
    return { success: false, message: "Please check your article content.", errors: { content: "Add article text and keep its formatting within 100,000 characters." } };
  }
  const removedKeys: string[] = [];
  let savedId = id;
  try {
    if (id) validateId(id);
    validateId(fields.categoryId);
    const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, fields.categoryId)).limit(1);
    if (!category) return { success: false, message: "Choose an available category.", errors: { categoryId: "This category no longer exists." } };
    const banner = uploadToken ? readUploadReceipt(uploadToken, "blogs") : undefined;
    if (banner) await confirmImageUpload(banner);
    const values = {
      title: fields.title, slug: fields.slug, categoryId: fields.categoryId, publishDate: fields.publishDate,
      authorName: fields.authorName, metaTitle: fields.metaTitle, metaDescription: fields.metaDescription,
      content: fields.content, isDraft: fields.isDraft,
    };
    await db.transaction(async tx => {
      if (id) {
        const [existing] = await tx.select({ image: blogs.mainBannerImage }).from(blogs).where(eq(blogs.id, id)).for("update");
        if (!existing) throw new Error("This blog no longer exists. Return to the list and refresh.");
        if (!banner) await confirmImageUpload(existing.image);
        await tx.update(blogs).set({ ...values, ...(banner ? { mainBannerImage: banner } : {}) }).where(eq(blogs.id, id));
        if (banner && banner !== existing.image) removedKeys.push(existing.image);
      } else {
        if (!banner) throw new Error("Choose a banner image.");
        const [created] = await tx.insert(blogs).values({ ...values, mainBannerImage: banner }).returning({ id: blogs.id });
        savedId = created.id;
      }
    });
  } catch (error) {
    return { success: false, message: actionError(error) };
  }
  await deleteImages(removedKeys);
  revalidatePath("/admin/blogs");
  revalidatePath("/admin/categories");
  if (id) revalidatePath(`/admin/blogs/${id}/edit`);
  return { success: true, data: { id: savedId } };
}

export async function previewBlogContentAction(content: string): Promise<{ html?: string; error?: string }> {
  if (typeof content !== "string" || content.length > MAX_BLOG_CONTENT_LENGTH) return { error: "Keep the article within 100,000 characters, including formatting." };
  const html = sanitizeBlogContent(content);
  if (html.length > MAX_BLOG_CONTENT_LENGTH) return { error: "Keep the article within 100,000 characters, including formatting." };
  return { html };
}

export async function deleteBlog(id: string): Promise<ActionState> {
  let keys: string[] = [];
  try {
    validateId(id);
    const deleted = await db.delete(blogs).where(eq(blogs.id, id)).returning({ image: blogs.mainBannerImage });
    if (!deleted.length) return { error: "This blog no longer exists." };
    keys = deleted.map(row => row.image);
  } catch (error) {
    return { error: actionError(error) };
  }
  await deleteImages(keys);
  revalidatePath("/admin/blogs");
  revalidatePath("/admin/categories");
  return {};
}

export async function loadBlogs() {
  return readCatalog(async () => {
    const [rows, categories] = await Promise.all([getBlogList(), getCategories()]);
    return {
      categories,
      records: rows.map(blog => ({
        id: blog.id,
        name: blog.title,
        slug: blog.slug,
        status: blog.isDraft ? "draft" : "published",
        categoryId: blog.categoryId,
        fields: { Category: blog.category, Author: blog.authorName, "Publish date": blog.publishDate },
      })),
    };
  });
}
