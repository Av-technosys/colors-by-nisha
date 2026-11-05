import { ArticleSkeleton } from "@/components/ui/PageSkeletons";
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BlogPostDetailContent } from "@/components/blog/BlogPostDetailContent";
import { getPublicBlogPostBySlug, getPublicBlogPosts } from "@/helpers/public-blogs";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublicBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPublicBlogPostBySlug(slug);
  if (!post) {
    return { title: "Blog Not Found | Colors by Nisha" };
  }
  return {
    title: `${post.title} | Colors by Nisha Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

async function BlogPostContent({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const { post, prev, next, relatedPosts } = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogPostDetailContent
      post={post}
      prev={prev}
      next={next}
      relatedPosts={relatedPosts}
    />
  );
}

export default function BlogPostPage(props: BlogPostPageProps) {
  return (
    <main className="min-h-screen bg-white text-ink flex flex-col">
      <Suspense fallback={<ArticleSkeleton />}>
        <BlogPostContent {...props} />
      </Suspense>
    </main>
  );
}

