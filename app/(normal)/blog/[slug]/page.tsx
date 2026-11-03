import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
    <div className="min-h-screen bg-white text-ink flex flex-col">
      <Header solid={true} activeNav="blogs" />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[50vh] grid place-items-center text-sm text-neutral-400 font-sans">Loading article...</div>}>
          <BlogPostContent {...props} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

