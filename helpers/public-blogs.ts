import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs, categories } from "@/lib/db/schema";
import { imageUrl } from "@/helpers/storage/s3";
import { sanitizeBlogContent } from "@/helpers/admin/blog-content.server";
import { getBlogContentText } from "@/helpers/admin/blog-content";
import { blogPostsData, type BlogPost } from "@/data/blogs";

export function formatBlogDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

export async function resolveBlogBannerImage(blog: { id: string; mainBannerImage: string; updatedAt: Date }): Promise<string> {
  if (!blog.mainBannerImage) return "/Home/images/015_kesari_rang__IMG_0124.jpg";
  if (blog.mainBannerImage.startsWith("data:")) {
    return `/api/admin/blogs/${blog.id}/image?v=${blog.updatedAt.getTime()}`;
  }
  if (blog.mainBannerImage.startsWith("/") || /^https?:\/\//i.test(blog.mainBannerImage)) {
    return blog.mainBannerImage;
  }
  try {
    return await imageUrl(blog.mainBannerImage);
  } catch {
    return `/api/admin/blogs/${blog.id}/image?v=${blog.updatedAt.getTime()}`;
  }
}

function calculateReadTime(content: string): string {
  const words = getBlogContentText(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

export async function getPublicBlogPosts(): Promise<BlogPost[]> {
  try {
    const rows = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        category: categories.name,
        categoryId: blogs.categoryId,
        publishDate: blogs.publishDate,
        mainBannerImage: blogs.mainBannerImage,
        authorName: blogs.authorName,
        metaTitle: blogs.metaTitle,
        metaDescription: blogs.metaDescription,
        content: blogs.content,
        isDraft: blogs.isDraft,
        updatedAt: blogs.updatedAt,
        createdAt: blogs.createdAt,
      })
      .from(blogs)
      .innerJoin(categories, eq(blogs.categoryId, categories.id))
      .where(eq(blogs.isDraft, false))
      .orderBy(desc(blogs.publishDate), desc(blogs.createdAt));

    if (!rows || rows.length === 0) {
      return blogPostsData;
    }

    const posts: BlogPost[] = await Promise.all(
      rows.map(async (row) => {
        const image = await resolveBlogBannerImage({
          id: row.id,
          mainBannerImage: row.mainBannerImage,
          updatedAt: row.updatedAt,
        });

        const plainText = getBlogContentText(row.content);
        const excerpt =
          row.metaDescription ||
          (plainText.slice(0, 180) + (plainText.length > 180 ? "..." : ""));

        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          category: row.category || "News",
          excerpt,
          author: row.authorName,
          date: formatBlogDate(row.publishDate),
          readTime: calculateReadTime(row.content),
          image,
          contentHtml: sanitizeBlogContent(row.content),
          intro: "",
          sections: [],
        };
      })
    );

    return posts;
  } catch (err) {
    console.error("Error fetching public blog posts from DB, using fallback:", err);
    return blogPostsData;
  }
}

export async function getPublicBlogPostBySlug(slug: string): Promise<{
  post: BlogPost | null;
  prev: BlogPost | null;
  next: BlogPost | null;
  relatedPosts: BlogPost[];
}> {
  const allPosts = await getPublicBlogPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);

  if (currentIndex === -1) {
    return { post: null, prev: null, next: null, relatedPosts: [] };
  }

  const post = allPosts[currentIndex];
  const prev = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const next = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return { post, prev, next, relatedPosts };
}

