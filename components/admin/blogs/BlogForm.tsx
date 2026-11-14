"use client";

import { Form } from "@/components/ui/Form";


import { UserFacingError, friendlyError } from "@/helpers/errors";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ImagePlus, LoaderCircle, Save, X } from "lucide-react";
import { toast } from "sonner";
import { discardImageUploadAction, uploadImageAction } from "@/app/admin/images/actions";
import { saveBlogAction } from "@/app/admin/blogs/actions";
import { slugify } from "@/helpers/admin/slugify";
import { getBlogContentText } from "@/helpers/admin/blog-content";
import { emptyBlog, MAX_BANNER_BYTES, validateBlogFields, type AdminBlog, type BlogCategory, type BlogFields } from "./blog-fields";

const BlogEditor = dynamic(() => import("./BlogEditor"), { ssr: false, loading: () => <div aria-label="Loading editor" className="h-[420px] rounded-md bg-[#f2eff6] motion-safe:animate-pulse" /> });

function articleDescription(content: string) {
  const paragraph = content.match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i)?.[1] ?? content;
  return getBlogContentText(paragraph).slice(0, 2000);
}

type FormErrors = Partial<Record<keyof BlogFields, string>>;

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return <div className="min-w-0">
    <label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}<span aria-hidden="true" className="ml-1 text-red-600">*</span></label>
    {children}
    {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs leading-5 text-red-600">{error}</p>}
  </div>;
}

export default function BlogForm({ initialBlog, categories }: { initialBlog?: AdminBlog; categories: BlogCategory[] }) {
  const existing = initialBlog;
  const blogId = existing?.id;
  const [initial] = useState<BlogFields>(() => existing ? { title: existing.title, slug: existing.slug, categoryId: existing.categoryId, publishDate: existing.publishDate, mainBannerImage: existing.mainBannerImage, authorName: existing.authorName, metaTitle: existing.metaTitle || existing.title, metaDescription: existing.metaDescription || articleDescription(existing.content), content: existing.content, isDraft: existing.isDraft } : { ...emptyBlog });
  const [values, setValues] = useState<BlogFields>(initial);
  const [editorVersion, setEditorVersion] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [readingImage, setReadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const imageUpload = useRef("");
  const [imageFailed, setImageFailed] = useState(false);
  const savingRef = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const fileReader = useRef<FileReader | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const allowNavigation = useRef(false);
  const router = useRouter();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  useEffect(() => () => { fileReader.current?.abort(); fileReader.current = null; }, []);

  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      if (allowNavigation.current) return;
      event.preventDefault(); event.returnValue = "";
    }
    function confirmLink(event: MouseEvent) {
      if (allowNavigation.current || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (saving) { event.preventDefault(); event.stopPropagation(); return; }
      if (anchor.href === window.location.href || (anchor.pathname === window.location.pathname && anchor.hash)) return;
      if (!window.confirm("Discard unsaved blog changes?")) { event.preventDefault(); event.stopPropagation(); }
      else allowNavigation.current = true;
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", confirmLink, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", confirmLink, true); };
  }, [dirty, saving]);

  function update<K extends keyof BlogFields>(key: K, value: BlogFields[K]) {
    allowNavigation.current = false;
    setSubmitError("");
    setValues(current => {
      const next = { ...current, [key]: value };
      if (key === "title") {
        if (!current.slug || current.slug === slugify(current.title)) next.slug = slugify(String(value));
        if (!current.metaTitle || current.metaTitle === current.title) next.metaTitle = String(value);
      }
      if (key === "content") {
        const previousText = articleDescription(current.content);
        if (!current.metaDescription || current.metaDescription === previousText) {
          next.metaDescription = articleDescription(String(value));
        }
      }
      return next;
    });
    setErrors(current => ({ ...current, [key]: undefined }));
  }

  function cancel() {
    if (saving) return;
    if (dirty && !window.confirm("Discard unsaved blog changes?")) return;
    allowNavigation.current = true;
    if (imageUpload.current) void discardImageUploadAction(imageUpload.current, "blogs");
    router.push("/admin/blogs");
  }

  function selectImage(file?: File) {
    fileReader.current?.abort();
    fileReader.current = null;
    if (!file) { setReadingImage(false); return; }
    setImageFailed(true);
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setErrors(current => ({ ...current, mainBannerImage: "Choose a JPG, PNG, WebP or GIF image." }));
      toast.error("Choose a JPG, PNG, WebP or GIF image.");
      setReadingImage(false); return;
    }
    if (file.size > MAX_BANNER_BYTES) {
      setErrors(current => ({ ...current, mainBannerImage: "Choose an image no larger than 1 MB." }));
      toast.error("The image must be 1 MB or smaller.");
      setReadingImage(false); return;
    }
    setReadingImage(true);
    const reader = new FileReader();
    fileReader.current = reader;
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      const image = new window.Image();
      image.src = reader.result;
      try {
        await image.decode();
        if (fileReader.current !== reader) return;
        update("mainBannerImage", reader.result);
        const upload = new FormData();
        upload.set("image", file);
        upload.set("folder", "blogs");
        const result = await uploadImageAction(upload);
        if (result.error || !result.token) throw new UserFacingError(result.error || "Please re-upload the image.");
        if (fileReader.current !== reader) { void discardImageUploadAction(result.token, "blogs"); return; }
        if (imageUpload.current) void discardImageUploadAction(imageUpload.current, "blogs");
        imageUpload.current = result.token;
        setImageFailed(false);
        update("mainBannerImage", result.url);
        toast.success("Banner image uploaded.", { id: "banner-image" });
      } catch (error) {
        if (fileReader.current === reader) {
          const message = friendlyError(error, "Upload failed. Please re-upload the image.");
          setImageFailed(true);
          setErrors(current => ({ ...current, mainBannerImage: message }));
          toast.error(message);
        }
      } finally { if (fileReader.current === reader) setReadingImage(false); }
    };
    reader.onerror = () => { toast.error("This image could not be read. Try another file."); setErrors(current => ({ ...current, mainBannerImage: "This image could not be read. Try another file." })); setReadingImage(false); };
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current || readingImage) return;
    const next = validateBlogFields(values);
    if (imageFailed || (!blogId && !imageUpload.current)) next.mainBannerImage = "The banner image has not uploaded. Please re-upload the image.";
    if (!categories.some(category => category.id === values.categoryId)) next.categoryId = "Choose an available category.";
    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length) {
      toast.error("Please check the highlighted fields.", { description: Object.values(next)[0], id: "blog-validation" });
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (key !== "mainBannerImage") data.set(key, String(value));
    }
    if (blogId) data.set("id", blogId);
    data.set("keepImage", String(Boolean(values.mainBannerImage)));
    if (imageUpload.current) data.set("imageUploadToken", imageUpload.current);
    savingRef.current = true;
    setSaving(true);
    try {
      const result = await saveBlogAction(data);
      if (!result.success) {
        setErrors(result.errors ?? {});
        setSubmitError(result.message);
        toast.error(result.message);
        requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-save-error]')?.focus());
        return;
      }
      allowNavigation.current = true;
      toast.success(blogId ? "Blog updated." : "Blog created.");
      if (!blogId) {
        setValues({ ...emptyBlog });
        setEditorVersion(value => value + 1);
        imageUpload.current = "";
        form.current?.reset();
      }
      router.replace("/admin/blogs");
      router.refresh();
    } catch { setSubmitError("The connection was interrupted. Your details are still here. Please try again."); toast.error("The blog could not be saved. Your details are still here."); }
    finally { savingRef.current = false; setSaving(false); }
  }

  return <>
    <button type="button" onClick={cancel} disabled={saving} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-purple"><ArrowLeft size={16} aria-hidden="true" />Back to blogs</button>
    <h1 className="text-2xl font-display tracking-tight text-purple sm:text-3xl">{blogId ? "Edit blog" : "Add blog"}</h1>
    <p className="mt-3 text-sm leading-6 text-neutral-500">{blogId ? "Update the article details below." : "Fill in the details for your new article."} Fields marked * are required.</p>
    <Form ref={form} autoComplete="off" noValidate onSubmit={submit} className="mt-6 min-w-0">
      <fieldset disabled={saving} className="min-w-0 space-y-5 sm:space-y-7">
      <legend className="sr-only">Blog form</legend>
      <section aria-labelledby="blog-details-heading" className="space-y-6 rounded-md border border-[#e5e1da] bg-white p-4 sm:p-6 lg:p-8">
        <h2 id="blog-details-heading" className="text-lg font-display text-purple">Blog details</h2>
        <Field id="blog-title" label="Title" error={errors.title}><input id="blog-title" required value={values.title} onChange={event => update("title", event.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "blog-title-error" : undefined} className="h-11 w-full rounded-md border border-[#e5e1da] px-3 text-base sm:text-sm outline-none aria-invalid:border-red-400 focus:border-purple focus:ring-2 focus:ring-purple/10" /></Field>
        <Field id="blog-slug" label="Slug" error={errors.slug}><input id="blog-slug" required value={values.slug} onChange={event => update("slug", event.target.value)} aria-invalid={Boolean(errors.slug)} aria-describedby={`blog-slug-hint${errors.slug ? " blog-slug-error" : ""}`} className="h-11 w-full rounded-md border border-[#e5e1da] px-3 text-base sm:text-sm outline-none aria-invalid:border-red-400 focus:border-purple focus:ring-2 focus:ring-purple/10" /><p id="blog-slug-hint" className="mt-2 break-all text-xs text-neutral-400">Article URL: /blog/{values.slug || "your-blog-title"}</p></Field>
        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field id="blog-category" label="Category" error={errors.categoryId}><select id="blog-category" required value={values.categoryId} onChange={event => update("categoryId", event.target.value)} aria-invalid={Boolean(errors.categoryId)} aria-describedby={errors.categoryId ? "blog-category-error" : undefined} className="h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-base sm:text-sm outline-none aria-invalid:border-red-400 focus:border-purple focus:ring-2 focus:ring-purple/10"><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{!categories.length && <p className="mt-2 text-xs text-neutral-500">Add a blog category using Manage categories on the Blogs page first.</p>}</Field>
          <Field id="blog-author" label="Author name" error={errors.authorName}><input id="blog-author" required value={values.authorName} onChange={event => update("authorName", event.target.value)} aria-invalid={Boolean(errors.authorName)} aria-describedby={errors.authorName ? "blog-author-error" : undefined} className="h-11 w-full rounded-md border border-[#e5e1da] px-3 text-base sm:text-sm outline-none aria-invalid:border-red-400 focus:border-purple focus:ring-2 focus:ring-purple/10" /></Field>
          <Field id="blog-date" label="Publish date" error={errors.publishDate}><input id="blog-date" type="date" required value={values.publishDate} onChange={event => update("publishDate", event.target.value)} aria-invalid={Boolean(errors.publishDate)} aria-describedby={errors.publishDate ? "blog-date-error" : undefined} className="h-11 w-full min-w-0 rounded-md border border-[#e5e1da] bg-white px-3 text-base sm:text-sm outline-none aria-invalid:border-red-400 focus:border-purple focus:ring-2 focus:ring-purple/10" /></Field>
        </div>
        <Field id="blog-banner" label="Main banner image" error={errors.mainBannerImage}>
          {values.mainBannerImage && <div className="relative mb-4 max-w-xl overflow-hidden rounded-md border border-[#f2eff6]"><Image src={values.mainBannerImage} alt="Blog banner preview" width={720} height={360} unoptimized className="max-h-72 w-full object-contain" /><button type="button" aria-label="Remove banner image" onClick={() => { fileReader.current?.abort(); fileReader.current = null; setReadingImage(false); if (imageUpload.current) void discardImageUploadAction(imageUpload.current, "blogs"); imageUpload.current = ""; setImageFailed(false); update("mainBannerImage", ""); if (fileInput.current) fileInput.current.value = ""; }} className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-md border border-[#e5e1da] bg-white text-neutral-500 shadow-sm hover:text-red-600"><X size={18} /></button></div>}
          <div className="flex flex-wrap items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#f2eff6] text-purple"><ImagePlus size={21} aria-hidden="true" /></span><input ref={fileInput} id="blog-banner" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => { selectImage(event.target.files?.[0]); event.target.value = ""; }} aria-invalid={Boolean(errors.mainBannerImage)} aria-describedby={`blog-banner-hint${errors.mainBannerImage ? " blog-banner-error" : ""}`} className="block min-w-0 max-w-full text-xs text-neutral-500 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#f2eff6] file:px-4 file:py-3 file:text-xs file:font-semibold file:text-purple" /></div>
          <p id="blog-banner-hint" className="mt-3 text-xs leading-5 text-neutral-400">JPG, PNG, WebP or GIF, up to 1 MB. Your image uploads as soon as you select it.</p>
          {readingImage && <p role="status" className="mt-2 text-xs text-purple">Uploading image…</p>}
        </Field>
        <div className="space-y-6 border-t border-[#f2eff6] pt-6">
          <Field id="blog-meta-title" label="Meta title" error={errors.metaTitle}><input id="blog-meta-title" required value={values.metaTitle} onChange={event => update("metaTitle", event.target.value)} aria-invalid={Boolean(errors.metaTitle)} aria-describedby={errors.metaTitle ? "blog-meta-title-error" : undefined} className="h-11 w-full rounded-md border border-[#e5e1da] px-3 text-base sm:text-sm outline-none aria-invalid:border-red-400 focus:border-purple focus:ring-2 focus:ring-purple/10" /><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs leading-5 text-neutral-400"><p>Browser and search title; not shown in the article.</p><span>{values.metaTitle.length} characters</span></div></Field>
          <Field id="blog-description" label="Meta description" error={errors.metaDescription}><textarea id="blog-description" required rows={3} value={values.metaDescription} onChange={event => update("metaDescription", event.target.value)} aria-invalid={Boolean(errors.metaDescription)} aria-describedby={errors.metaDescription ? "blog-description-error" : undefined} className="w-full resize-y rounded-md border border-[#e5e1da] px-3 py-3 text-sm leading-6 outline-none aria-invalid:border-red-400 focus:border-purple focus:ring-2 focus:ring-purple/10" /><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs leading-5 text-neutral-400"><p>A unique summary for search engines.</p><span>{values.metaDescription.length} characters</span></div></Field>
          <div aria-label="Search appearance preview" className="rounded-md border border-[#e5e1da] bg-[#f9f8f5] p-4 sm:p-5">
            <p className="mb-3 text-xs font-semibold text-neutral-500">Search appearance preview</p>
            <p className="break-all text-xs text-neutral-500">Colors by Nisha · /blog/{values.slug || "your-blog-title"}</p>
            <p className="mt-2 break-words text-lg font-semibold leading-7 text-purple">{values.metaTitle || values.title || "Your search title"}</p>
            <p className="mt-1 break-words text-sm leading-6 text-neutral-500">{values.metaDescription || "Your meta description will appear here."}</p>
            <p className="mt-3 text-[11px] leading-5 text-neutral-400">Preview only. Search engines may choose a different title or summary.</p>
          </div>
        </div>
      </section>
      <section aria-labelledby="blog-content-heading" className="rounded-md border border-[#e5e1da] bg-white p-4 sm:p-6 lg:p-8">
        <h2 id="blog-content-heading" className="mb-6 text-lg font-display text-purple">Article content</h2>
        <div>
          <p id="blog-content-label" className="mb-3 text-sm font-semibold">Content <span aria-hidden="true" className="text-red-600">*</span></p>
          <BlogEditor key={`${blogId ?? "new"}-${editorVersion}`} id="blog-content" value={values.content} onChange={content => update("content", content)} disabled={saving} error={errors.content} />
          {errors.content && <p id="blog-content-error" role="alert" className="mt-2 text-xs leading-5 text-red-600">{errors.content}</p>}
        </div>
      </section>
      <section aria-labelledby="blog-status-heading" className="rounded-md border border-[#e5e1da] bg-white p-4 sm:p-6 lg:p-8">
        <h2 id="blog-status-heading" className="mb-4 text-lg font-display text-purple">Status</h2>
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={values.isDraft} onChange={event => update("isDraft", event.target.checked)} className="size-4 accent-purple" />Save as draft</label>
        <p className="mt-3 text-xs leading-5 text-neutral-500">{values.isDraft ? "This blog will be saved as a draft." : "This blog will be marked as published in the database."}</p>
      </section>
      {submitError && <p data-save-error tabIndex={-1} role="alert" className="rounded-md bg-red-50 p-4 text-sm leading-6 text-red-700 outline-none">{submitError}</p>}
      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:items-center sm:justify-end"><button type="button" onClick={cancel} className="min-h-11 rounded-md border border-[#e5e1da] bg-white px-5 text-sm font-semibold hover:bg-[#f9f8f5]">Cancel</button><button type="submit" disabled={readingImage || saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-purple px-5 text-sm font-semibold text-white hover:bg-purple/90 disabled:cursor-wait disabled:opacity-60">{saving || readingImage ? <LoaderCircle size={17} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Save size={17} aria-hidden="true" />}{saving ? "Saving…" : readingImage ? "Uploading image…" : "Save blog"}</button></div>
      </fieldset>
    </Form>
  </>;
}
