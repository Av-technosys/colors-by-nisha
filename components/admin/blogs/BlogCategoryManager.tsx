"use client";

import { Form } from "@/components/ui/Form";


import { useCallback, useState, useTransition, type FormEvent } from "react";
import { Pencil, Tags, Trash2 } from "lucide-react";
import { loadBlogCategories, saveBlogCategory, deleteBlogCategory } from "@/app/admin/blogs/category-actions";
import type { BlogCategoryRow } from "@/helpers/admin/blog-categories";
import { slugify } from "@/helpers/admin/slugify";
import { Modal } from "@/components/ui/Modal";

const empty = { id: "", name: "", slug: "" };

export function BlogCategoryManager({ onChange }: { onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BlogCategoryRow[]>([]);
  const [form, setForm] = useState(empty);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const close = useCallback(() => { if (!pending) setOpen(false); }, [pending]);

  async function showCategories() {
    setOpen(true); setLoading(true); setError(""); setNotice(""); setForm(empty); setDeleting("");
    try {
      const result = await loadBlogCategories();
      if (result.error) setError(result.error);
      else setCategories(result.categories ?? []);
    } catch { setError("Blog categories could not be loaded. Please try again."); }
    finally { setLoading(false); }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setError(""); setNotice("");
    startTransition(async () => {
      try {
        const result = await saveBlogCategory(data);
        if (result.error) { setError(result.error); return; }
        if (!result.category) { setError("The category could not be saved. Please refresh and try again."); return; }
        const saved = result.category;
        setCategories(current => {
          const existing = current.find(item => item.id === saved.id);
          const next = existing ? current.map(item => item.id === saved.id ? { ...item, ...saved } : item) : [...current, { ...saved, blogCount: 0 }];
          return next.sort((a, b) => a.name.localeCompare(b.name));
        });
        setNotice(form.id ? "Blog category updated." : "Blog category added.");
        setForm(empty); setDeleting(""); onChange();
      } catch { setError("The category could not be saved. Please try again."); }
    });
  }

  function remove(id: string) {
    if (pending) return;
    setError(""); setNotice("");
    startTransition(async () => {
      try {
        const result = await deleteBlogCategory(id);
        if (result.error) { setError(result.error); return; }
        setCategories(current => current.filter(item => item.id !== id));
        if (form.id === id) setForm(empty);
        setDeleting(""); setNotice("Blog category deleted."); onChange();
      } catch { setError("The category could not be deleted. Please try again."); }
    });
  }

  return <>
    <button type="button" disabled={loading} onClick={showCategories} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#ddd5c8] bg-white px-4 text-sm text-purple disabled:opacity-50">
      <Tags size={16} aria-hidden="true" />Manage categories
    </button>
    {open && <Modal title="Manage blog categories" onClose={close} className="w-full max-w-2xl p-5 sm:p-7">
      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#94764d]">Blog categories</p>
      <h2 className="pr-8 font-display text-2xl">Manage blog categories</h2>
      <p className="mb-6 mt-2 text-xs leading-relaxed text-neutral-500">Organise your journal stories. Categories with blogs must be reassigned before deletion.</p>
      {error && <p role="alert" className="mb-4 rounded-md bg-[#f7eeec] p-3 text-xs text-[#a16b60]">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-md bg-[#edf4ed] p-3 text-xs text-[#517254]">{notice}</p>}
      {loading ? <p role="status" className="py-10 text-center text-sm text-neutral-500">Loading categories…</p> : <>
        <div className="mb-6 max-h-64 overflow-auto rounded-md border border-[#e8e5df]">
          {!categories.length && <p className="p-6 text-center text-xs text-neutral-400">No blog categories yet. Add your first below.</p>}
          <ul className="divide-y divide-[#eeeae4]">
            {categories.map(category => <li key={category.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="break-words font-display text-sm">{category.name}</p>
                <p className="mt-1 break-all text-[11px] text-neutral-400">{category.slug} · {category.blogCount} blog{category.blogCount === 1 ? "" : "s"}</p>
              </div>
              {deleting === category.id ? <div className="flex flex-wrap items-center gap-3 text-xs">
                <span>Delete category?</span>
                <button type="button" disabled={pending} onClick={() => remove(category.id)} className="min-h-10 text-[#a16b60] underline underline-offset-4">Delete</button>
                <button type="button" disabled={pending} onClick={() => setDeleting("")} className="min-h-10 text-neutral-500">Cancel</button>
              </div> : <div className="flex items-center gap-1">
                <button type="button" disabled={pending} onClick={() => { setForm({ id: category.id, name: category.name, slug: category.slug }); setDeleting(""); setError(""); setNotice(""); }} aria-label={`Edit ${category.name}`} className="grid size-10 place-items-center rounded-md text-purple hover:bg-[#f1edf5]"><Pencil size={15} /></button>
                <button type="button" disabled={pending || category.blogCount > 0} onClick={() => { setDeleting(category.id); setError(""); }} aria-label={`Delete ${category.name}`} title={category.blogCount ? "Reassign this category’s blogs before deleting it" : "Delete category"} className="grid size-10 place-items-center rounded-md text-[#a16b60] hover:bg-[#f7eeec] disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={15} /></button>
              </div>}
            </li>)}
          </ul>
        </div>
        <Form onSubmit={save} autoComplete="off">
          <h3 className="mb-4 font-display text-lg">{form.id ? "Edit category" : "Add category"}</h3>
          <input type="hidden" name="id" value={form.id} />
          <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2 disabled:opacity-60">
            <label className="text-xs text-neutral-500">Category name
              <input name="name" required maxLength={255} value={form.name} onChange={event => {
                const name = event.target.value;
                setForm(current => ({ ...current, name, slug: !current.slug || current.slug === slugify(current.name) ? slugify(name) : current.slug }));
              }} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm outline-none focus:border-purple" />
            </label>
            <label className="text-xs text-neutral-500">Slug
              <input name="slug" required maxLength={255} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={event => setForm(current => ({ ...current, slug: event.target.value }))} className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-sm outline-none focus:border-purple" />
            </label>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#eeeae4] pt-4 sm:col-span-2">
              {form.id && <button type="button" onClick={() => setForm(empty)} className="min-h-11 px-3 text-sm text-neutral-500">Cancel edit</button>}
              <button type="submit" className="min-h-11 rounded-md bg-purple px-5 text-sm text-white">{pending ? "Saving…" : form.id ? "Save changes" : "Add category"}</button>
            </div>
          </fieldset>
        </Form>
      </>}
    </Modal>}
  </>;
}
