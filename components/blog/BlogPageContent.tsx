"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type BlogPost, getAllBlogPosts } from "@/data/blogs";

interface BlogPageContentProps {
  posts?: BlogPost[];
}

export function BlogPageContent({ posts: initialPosts }: BlogPageContentProps = {}) {
  const posts = initialPosts && initialPosts.length > 0 ? initialPosts : getAllBlogPosts();

  return (
    <div className="bg-white text-ink pb-10 md:pb-14">
      {/* Top Breadcrumb & Heading (Matches Screenshot) */}
      <section className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] pt-8 pb-6 md:pt-10 md:pb-8 text-center">
        {/* Breadcrumb: Home · Blogs */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="inline-flex items-center gap-2 text-xs text-neutral-500 font-medium font-sans">
            <li>
              <Link href="/" className="hover:text-ink transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400 select-none">·</li>
            <li className="text-neutral-700 font-semibold">Blogs</li>
          </ol>
        </nav>

        {/* Title: Blogs */}
        <h1 className="font-display text-3xl font-normal leading-tight tracking-normal md:text-4xl text-ink">
          Blogs
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-sm md:text-[15px] text-neutral-500 font-sans max-w-lg mx-auto">
          Discover style insights and trends on our fashion lifestyle blog.
        </p>
      </section>

      {/* Main Content Layout: Left Sidebar (Popular Posts) + Right Main Grid */}
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
          {/* Left Sidebar: Popular Posts */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <h2 className="font-display text-lg md:text-xl font-medium tracking-tight text-ink mb-5">
              Popular Posts
            </h2>

            <div className="space-y-4">
              {posts.map((post) => (
                <article key={`pop-${post.id}`} className="group flex items-center gap-3.5">
                  {/* Square Thumbnail */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative size-16 shrink-0 overflow-hidden rounded-md bg-neutral-100"
                  >
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="64px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Title & Date */}
                  <div className="min-w-0 flex-1">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3 className="font-display text-xs md:text-sm font-semibold text-ink leading-snug line-clamp-2 group-hover:text-neutral-700 group-hover:underline transition">
                        {post.title}
                      </h3>
                    </Link>
                    <time className="mt-1 block text-[11px] text-neutral-400 font-sans">
                      {post.date}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          </aside>

          {/* Right Main Grid: 3 Articles */}
          <main className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7 items-start">
              {posts.map((post) => (
                <article key={post.id} className="group flex flex-col">
                  {/* Article Featured Image */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-16/10 w-full overflow-hidden rounded-md bg-neutral-100 shadow-2xs"
                  >
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-103"
                    />
                  </Link>

                  {/* Article Title */}
                  <Link href={`/blog/${post.slug}`} className="block mt-3.5">
                    <h2 className="font-display text-lg md:text-xl font-medium text-ink leading-snug group-hover:text-neutral-700 transition">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Article Excerpt */}
                  <p className="mt-2 text-sm md:text-[15px] text-neutral-500 font-sans leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Article Author & Date Meta */}
                  <div className="mt-3.5 pt-1 text-xs text-neutral-600 font-sans">
                    Post by{" "}
                    <span className="text-[#d0473e] font-semibold hover:underline cursor-pointer">
                      {post.author}
                    </span>{" "}
                    <span className="text-neutral-500 ml-1">{post.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
