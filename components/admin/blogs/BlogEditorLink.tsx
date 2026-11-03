"use client";

import { useCallback, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { normalizeBlogLink } from "@/helpers/admin/blog-content";

export default function BlogEditorLink({ editor, active, disabled }: { editor: Editor; active: boolean; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");
  const [newTab, setNewTab] = useState(false);
  const [error, setError] = useState("");
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => editor.commands.focus());
  }, [editor]);

  function showDialog() {
    const attributes = editor.getAttributes("link");
    setHref(typeof attributes.href === "string" ? attributes.href : "");
    setNewTab(attributes.target === "_blank");
    setError("");
    setOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const url = normalizeBlogLink(href);
    if (!url) { setError("Enter a website URL, site path, email link or phone link."); return; }
    const attributes = { href: url, target: newTab ? "_blank" : null, rel: newTab ? "noopener noreferrer" : null };
    if (editor.state.selection.empty && !editor.isActive("link")) {
      editor.chain().focus().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: attributes }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink(attributes).run();
    }
    close();
    toast.success("Link added.");
  }

  return <>
    <button type="button" disabled={disabled} aria-label="Insert or edit link" title="Insert or edit link" aria-pressed={active} aria-haspopup="dialog" aria-expanded={open} onMouseDown={event => event.preventDefault()} onClick={showDialog} className={`flex size-9 shrink-0 items-center justify-center rounded-lg disabled:opacity-35 ${active ? "bg-purple text-white" : "text-neutral-500 hover:bg-[#eee8f4] hover:text-purple"}`}><Link2 size={17} aria-hidden="true" /></button>
    {open && createPortal(
      <Modal title={active ? "Edit link" : "Add link"} onClose={close} className="w-full max-w-md p-6">
        <h2 className="font-display text-xl text-purple">{active ? "Edit link" : "Add link"}</h2>
        <p className="mt-2 text-sm text-neutral-500">Link selected text to a website or another page.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-xs text-neutral-500">Link URL<input value={href} onChange={event => { setHref(event.target.value); setError(""); }} placeholder="https://example.com or /contact" autoComplete="off" aria-invalid={Boolean(error)} className="mt-2 min-h-11 w-full rounded-lg border border-[#e5e1da] px-3 text-sm" /></label>
          {error && <p role="alert" className="text-xs text-[#a16b60]">{error}</p>}
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={newTab} onChange={event => setNewTab(event.target.checked)} className="size-4 accent-purple" />Open in a new tab</label>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            {active && <button type="button" onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); close(); }} className="mr-auto text-xs text-[#a16b60]">Remove link</button>}
            <button type="button" onClick={close} className="rounded-lg border border-[#e5e1da] px-4 py-2.5 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-purple px-4 py-2.5 text-sm text-white">Apply link</button>
          </div>
        </form>
      </Modal>, document.body,
    )}
  </>;
}
