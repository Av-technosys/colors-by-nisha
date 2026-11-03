"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { saveCategory } from "@/app/admin/categories/actions";
import type { categories } from "@/lib/db/schema";
import { slugify } from "@/helpers/admin/slugify";
import { PageHeading } from "./AdminUI";

export function CategoryForm({ category }: { category?: typeof categories.$inferSelect }) {
  const router = useRouter();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug || slugify(category?.name ?? ""));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      try {
        const result = await saveCategory({}, form);
        if (result.error) { setError(result.error); return; }
        if (result.success) {
          setName("");
          setSlug("");
          setError("");
          router.push("/admin/categories");
          router.refresh();
        }
      } catch {
        setError("Could not save this category. Please try again.");
      }
    });
  }

  return (
    <>
      <PageHeading eyebrow="Categories" title={category ? "Edit category" : "Add category"} description="Give your category a name and a unique URL slug." />
      <form autoComplete="off" onSubmit={handleSubmit} className="max-w-3xl rounded-xl border border-[#e8e5df] bg-white p-5 sm:p-7">
        <input type="hidden" name="id" value={category?.id ?? ""} />
        <fieldset disabled={pending} className="space-y-6 disabled:opacity-60">
          <label className="block text-xs text-neutral-500">
            Category name
            <input name="name" required maxLength={255} autoComplete="off" value={name} onChange={event => { const value = event.target.value; setName(value); if (!slug || slug === slugify(name)) setSlug(slugify(value)); }} className="mt-2 min-h-11 w-full rounded-lg border border-[#e5e1da] px-3 text-sm" />
          </label>
          <label className="block text-xs text-neutral-500">
            Slug
            <input name="slug" required maxLength={255} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="occasion-wear" autoComplete="off" value={slug} onChange={event => setSlug(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#e5e1da] px-3 text-sm" />
            <span className="mt-2 block text-[11px] text-neutral-400">Use lowercase letters, numbers, and hyphens.</span>
          </label>
          {error && <p role="alert" className="rounded-lg bg-[#f7eeec] p-3 text-xs text-[#a16b60]">{error}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-100 pt-5">
            <Link href="/admin/categories" className="inline-flex min-h-11 items-center px-4 text-sm text-neutral-500">Cancel</Link>
            <button type="submit" className="min-h-11 rounded-lg bg-purple px-5 font-display text-sm text-white disabled:opacity-50">{pending ? "Saving…" : "Save category"}</button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
