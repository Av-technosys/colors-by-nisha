"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type BlogPost, getAllBlogPosts, getAdjacentPosts } from "@/data/blogs";

interface BlogPostDetailContentProps {
  post: BlogPost;
  prev?: BlogPost | null;
  next?: BlogPost | null;
  relatedPosts?: BlogPost[];
}

export function BlogPostDetailContent({
  post,
  prev: initialPrev,
  next: initialNext,
  relatedPosts: initialRelatedPosts,
}: BlogPostDetailContentProps) {
  const [copied, setCopied] = useState(false);
  const allPosts = getAllBlogPosts();
  const relatedPosts =
    initialRelatedPosts !== undefined
      ? initialRelatedPosts
      : allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const adjacent = getAdjacentPosts(post.slug);
  const prev = initialPrev !== undefined ? initialPrev : adjacent.prev;
  const next = initialNext !== undefined ? initialNext : adjacent.next;

  const handleShare = (platform: "twitter" | "facebook" | "pinterest" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = post.title;

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "pinterest") {
      window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`, "_blank");
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="bg-white text-ink pb-20">
      {/* 1. Centered Breadcrumb (Matches Screenshot: Home · Blogs · Post Title) */}
      <section className="mx-auto max-w-[1100px] px-4 md:px-6 pt-6 pb-4 text-center">
        <nav aria-label="Breadcrumb">
          <ol className="inline-flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium font-sans flex-wrap">
            <li>
              <Link href="/" className="hover:text-ink transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400 select-none">·</li>
            <li>
              <Link href="/blog" className="hover:text-ink transition-colors">
                Blogs
              </Link>
            </li>
            <li className="text-neutral-400 select-none">·</li>
            <li className="text-neutral-700 font-semibold truncate max-w-xs md:max-w-md">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* 2. Category Pill (Matches Screenshot: "News") */}
        <div className="mt-4">
          <span className="inline-block rounded-full border border-neutral-200/90 bg-neutral-50 px-3.5 py-0.5 text-[11px] font-medium text-neutral-600 font-sans tracking-wide">
            {post.category || "News"}
          </span>
        </div>

        {/* 3. Centered Main Title (Matches Screenshot) */}
        <h1 className="font-display text-2xl md:text-3xl lg:text-[34px] font-bold text-ink text-center max-w-2xl mx-auto leading-snug mt-3">
          {post.title}
        </h1>

        {/* 4. Author & Date Meta (Matches Screenshot) */}
        <div className="mt-3 text-xs text-neutral-500 font-sans">
          Post by{" "}
          <span className="text-[#d0473e] font-semibold">
            {post.author}
          </span>{" "}
          · {post.date}
        </div>
      </section>

      {/* 5. Article Body (Centered narrow reading container ~680px) */}
      <main className="mx-auto max-w-[700px] px-4 md:px-6 pt-6">
        {/* Article Headline in body (if not already included in rich content) */}
        {(!post.contentHtml || !post.contentHtml.includes(post.title)) && (
          <h2 className="font-display text-lg md:text-xl font-bold text-ink mt-2 mb-4 leading-snug">
            {post.title}
          </h2>
        )}

        {/* Intro Paragraph */}
        {post.intro && (
          <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-sans mb-6">
            {post.intro}
          </p>
        )}

        {/* Dynamic Rich HTML Content (from Admin Database) */}
        {post.contentHtml ? (
          <div
            className="blog-rich-content text-xs md:text-sm text-neutral-600 leading-relaxed font-sans space-y-4
              [&_h2]:font-display [&_h2]:text-base [&_h2]:md:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:leading-snug
              [&_h3]:font-display [&_h3]:text-sm [&_h3]:md:text-base [&_h3]:font-bold [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:leading-snug
              [&_h4]:font-display [&_h4]:text-xs [&_h4]:md:text-sm [&_h4]:font-bold [&_h4]:text-ink [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:leading-snug
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-5
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-5
              [&_li]:leading-relaxed
              [&_a]:text-[#d0473e] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-ink
              [&_strong]:font-semibold [&_strong]:text-ink
              [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-500 [&_blockquote]:my-5
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-xs
              [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-50 [&_th]:p-2.5 [&_th]:font-semibold [&_th]:text-ink
              [&_td]:border [&_td]:border-neutral-200 [&_td]:p-2.5
              [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-w-full"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        ) : (
          /* Subsections: 1. Wedding Functions, 2. Festivals, etc. (fallback) */
          <div className="space-y-6">
            {post.sections?.map((section, idx) => (
              <div key={idx} className="space-y-2">
                {section.title && (
                  <h3 className="font-display text-sm md:text-base font-bold text-ink leading-snug">
                    {section.title}
                  </h3>
                )}

                {section.content && (
                  <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-sans">
                    {section.content}
                  </p>
                )}

                {/* Bullet list if any (Styling Tips) */}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-1.5 pt-1 text-xs md:text-sm text-neutral-600 font-sans">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-neutral-400 select-none">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 6. Share Section (Matches Screenshot) */}
        <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-sans">
            Share:
          </span>
          <div className="flex items-center gap-2">
            {/* Twitter / X */}
            <button
              onClick={() => handleShare("twitter")}
              className="size-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-ink hover:text-ink transition cursor-pointer"
              aria-label="Share on X / Twitter"
              title="Share on X"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleShare("facebook")}
              className="size-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-ink hover:text-ink transition cursor-pointer"
              aria-label="Share on Facebook"
              title="Share on Facebook"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* Pinterest */}
            <button
              onClick={() => handleShare("pinterest")}
              className="size-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-ink hover:text-ink transition cursor-pointer"
              aria-label="Share on Pinterest"
              title="Share on Pinterest"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
            </button>

            {/* Copy Link */}
            <button
              onClick={() => handleShare("copy")}
              className="size-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-ink hover:text-ink transition cursor-pointer"
              aria-label="Copy link"
              title="Copy link"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>

            {copied && (
              <span className="text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                Copied!
              </span>
            )}
          </div>
        </div>

        {/* 7. Next / Previous Post Navigation (Matches Screenshot) */}
        <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center justify-between gap-4">
          <div>
            {prev && (
              <Link href={`/blog/${prev.slug}`} className="group block text-left">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                  ‹ PREVIOUS POST
                </span>
                <span className="font-display text-xs md:text-sm font-semibold text-ink group-hover:underline">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>

          <div className="ml-auto text-right">
            {next && (
              <Link href={`/blog/${next.slug}`} className="group block text-right">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                  NEXT POST ›
                </span>
                <span className="font-display text-xs md:text-sm font-semibold text-ink group-hover:underline">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* 8. Related Posts Section (Matches Screenshot) */}
      <section className="mx-auto max-w-[1100px] px-4 md:px-6 pt-16 md:pt-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink text-center mb-8">
          Related Posts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
          {relatedPosts.map((rPost) => (
            <article key={rPost.id} className="group flex flex-col">
              {/* Image */}
              <Link
                href={`/blog/${rPost.slug}`}
                className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-neutral-100 shadow-2xs"
              >
                <Image
                  src={rPost.image}
                  alt={rPost.title}
                  fill
                  sizes="(min-width: 768px) 380px, 100vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-103"
                />
              </Link>

              {/* Title */}
              <Link href={`/blog/${rPost.slug}`} className="block mt-3">
                <h3 className="font-display text-base font-bold text-ink leading-snug group-hover:text-neutral-700 transition">
                  {rPost.title}
                </h3>
              </Link>

              {/* Excerpt */}
              <p className="mt-1.5 text-xs text-neutral-500 font-sans leading-relaxed line-clamp-3">
                {rPost.excerpt}
              </p>

              {/* Author & Date */}
              <div className="mt-2.5 text-xs text-neutral-600 font-sans">
                Post by{" "}
                <span className="text-[#d0473e] font-semibold hover:underline">
                  {rPost.author}
                </span>{" "}
                <span className="text-neutral-500 ml-1">{rPost.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
