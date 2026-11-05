import { CollectionSkeleton } from "@/components/ui/PageSkeletons";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogPageContent } from "@/components/blog/BlogPageContent";
import { getPublicBlogPosts } from "@/helpers/public-blogs";

export const metadata: Metadata = {
  title: "Fashion & Lifestyle Blogs | Colors by Nisha Vijay",
  description:
    "Discover style insights, ethnic fashion trends, and occasion styling guides from Colors by Nisha Vijay Jaipur.",
};

async function BlogListContent() {
  const posts = await getPublicBlogPosts();
  return <BlogPageContent posts={posts} />;
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white text-ink flex flex-col">
      <Suspense fallback={<CollectionSkeleton title="Blogs" blog />}>
        <BlogListContent />
      </Suspense>
    </main>
  );
}
