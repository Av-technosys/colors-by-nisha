import { getBlogContentText } from "@/helpers/admin/blog-content";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogFields {
  title: string;
  slug: string;
  categoryId: string;
  publishDate: string;
  mainBannerImage: string;
  authorName: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  isDraft: boolean;
}

export interface AdminBlog extends BlogFields { id: string; }
export type BlogErrors = Partial<Record<keyof BlogFields, string>>;
export type MutationResult<T = undefined> = { success: true; data: T } | { success: false; message: string; errors?: BlogErrors };
export const MAX_BANNER_BYTES = 1024 * 1024;

export function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const emptyBlog: BlogFields = {
  title: "", slug: "", categoryId: "", publishDate: "", mainBannerImage: "",
  authorName: "", metaTitle: "", metaDescription: "", content: "", isDraft: false,
};

export function validateBlogFields(values: BlogFields): BlogErrors {
  const errors: BlogErrors = {};
  const limits = { title: 300, slug: 200, categoryId: 200, authorName: 100, metaTitle: 300, metaDescription: 2000, content: 100000 } as const;
  for (const [key, limit] of Object.entries(limits) as [keyof typeof limits, number][]) {
    if (!(key === "content" ? getBlogContentText(values.content) : values[key].trim())) errors[key] = "This field is required.";
    else if (values[key].length > limit) errors[key] = `Keep this field within ${limit.toLocaleString("en-IN")} characters.`;
  }
  if (!values.mainBannerImage) errors.mainBannerImage = "Choose a banner image.";
  if (values.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) errors.slug = "Use lowercase letters, numbers and single hyphens.";
  const date = new Date(`${values.publishDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.publishDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== values.publishDate) errors.publishDate = "Enter a valid publish date.";
  return errors;
}

