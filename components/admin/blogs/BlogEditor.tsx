"use client";

import { useEffect, useId, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { Eye, LoaderCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { previewBlogContentAction } from "@/app/admin/blogs/actions";
import { blogContentToHtml, getBlogContentText, normalizeBlogLink } from "@/helpers/admin/blog-content";
import BlogContentFrame from "./BlogContentFrame";
import { BlogSpacing } from "./editor-commands";
import BlogEditorToolbar from "./BlogEditorToolbar";

export default function BlogEditor({ id, value, onChange, disabled, error }: { id: string; value: string; onChange: (html: string) => void; disabled: boolean; error?: string }) {
  const panelId = useId();
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [preview, setPreview] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      BlogSpacing,
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: { target: null, rel: null }, isAllowedUri: url => Boolean(normalizeBlogLink(url)) } }),
      TableKit.configure({ table: { resizable: false, renderWrapper: false } }),
    ],
    content: blogContentToHtml(value),
    editorProps: {
      attributes: { id, role: "textbox", "aria-label": "Article content", "aria-labelledby": `${id}-label`, "aria-multiline": "true", "aria-required": "true", "aria-invalid": String(Boolean(error)), ...(error ? { "aria-describedby": `${id}-error` } : {}), class: "min-h-[340px] px-5 py-5 outline-none" },
      transformPastedHTML: html => html.replace(/<(\/?)(h1)\b/gi, "<$1h2").replace(/<(\/?)(h5|h6)\b/gi, "<$1h4"),
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => { editor?.setEditable(!disabled && !previewBusy && mode === "edit", false); }, [editor, disabled, previewBusy, mode]);

  async function showPreview() {
    if (!editor || previewBusy) return;
    setPreviewBusy(true);
    try {
      const result = await previewBlogContentAction(editor.getHTML());
      if (result.error) { toast.error(result.error); return; }
      setPreview(result.html ?? ""); setMode("preview");
    } catch { toast.error("The preview could not be loaded. Your content is still here."); }
    finally { setPreviewBusy(false); }
  }

  if (!editor) return <div aria-label="Loading editor" className="h-[420px] rounded-xl bg-[#f2eff6] motion-safe:animate-pulse" />;
  const text = getBlogContentText(value);
  const wordCount = text ? text.split(/\s+/).length : 0;

  return <div className="min-w-0">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs leading-5 text-neutral-500">The blog title is H1. Use H2 for sections and H3–H4 for subsections.</p>
      <div role="group" aria-label="Content view" className="inline-flex gap-1 rounded-lg bg-[#f2eff6] p-1">
        <button type="button" disabled={disabled || previewBusy} aria-pressed={mode === "edit"} aria-controls={`${panelId}-editor`} onClick={() => setMode("edit")} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${mode === "edit" ? "bg-white text-purple shadow-sm" : "text-neutral-500"}`}><Pencil size={13} aria-hidden="true" />Edit</button>
        <button type="button" disabled={disabled || previewBusy} aria-pressed={mode === "preview"} aria-controls={`${panelId}-preview`} onClick={showPreview} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${mode === "preview" ? "bg-white text-purple shadow-sm" : "text-neutral-500"}`}>{previewBusy ? <LoaderCircle size={13} aria-hidden="true" className="animate-spin" /> : <Eye size={13} aria-hidden="true" />}Preview</button>
      </div>
    </div>
    <div className={`overflow-hidden rounded-xl border ${error ? "border-red-400" : "border-[#e5e1da]"}`}>
      <div id={`${panelId}-editor`} hidden={mode !== "edit"}>
        <BlogEditorToolbar editor={editor} disabled={disabled || previewBusy || mode !== "edit"} />
        <div className="max-h-[600px] overflow-auto bg-white"><BlogContentFrame><EditorContent editor={editor} /></BlogContentFrame></div>
      </div>
      {mode === "preview" && <div id={`${panelId}-preview`} className="min-h-[340px] bg-white p-5 sm:p-7">{getBlogContentText(preview) ? <BlogContentFrame html={preview} /> : <p className="text-sm text-neutral-400">Write some content to preview your article.</p>}</div>}
      <div className="flex flex-wrap justify-between gap-2 border-t border-[#f2eff6] bg-[#f9f8f5] px-4 py-3 text-[11px] text-neutral-500"><span>{wordCount} {wordCount === 1 ? "word" : "words"} · {text.length.toLocaleString("en-IN")} characters</span><span>Enter: paragraph · Shift+Enter: line break</span></div>
    </div>
  </div>;
}
