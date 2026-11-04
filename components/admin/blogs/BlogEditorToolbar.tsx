"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { Bold, Code, Italic, List, ListOrdered, Minus, Quote, Redo2, RemoveFormatting, Strikethrough, Underline, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import { formatSelectedBlock, setBlockSpacing } from "./editor-commands";
import BlogEditorLink from "./BlogEditorLink";

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={event => event.preventDefault()} onClick={onClick} className={`flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-purple disabled:cursor-default disabled:opacity-35 ${active ? "bg-purple text-white" : "text-neutral-500 hover:bg-[#eee8f4] hover:text-purple"}`}>{children}</button>;
}

export default function BlogEditorToolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const state = useEditorState({ editor, selector: ({ editor }) => ({
    block: editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : editor.isActive("heading", { level: 4 }) ? "h4" : "p",
    lineSpacing: editor.getAttributes(editor.isActive("heading") ? "heading" : "paragraph").lineSpacing ?? "",
    paragraphSpacing: editor.getAttributes(editor.isActive("heading") ? "heading" : "paragraph").paragraphSpacing ?? "",
    bold: editor.isActive("bold"), italic: editor.isActive("italic"), underline: editor.isActive("underline"), strike: editor.isActive("strike"),
    bullet: editor.isActive("bulletList"), ordered: editor.isActive("orderedList"), quote: editor.isActive("blockquote"), code: editor.isActive("codeBlock"),
    merge: editor.can().mergeCells(), split: editor.can().splitCell(), link: editor.isActive("link"), table: editor.isActive("table"), undo: editor.can().undo(), redo: editor.can().redo(),
  }) });

  function tableAction(action: string) {
    const chain = editor.chain().focus();
    switch (action) {
      case "insert": chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
      case "rowBefore": chain.addRowBefore().run(); break;
      case "rowAfter": chain.addRowAfter().run(); break;
      case "columnBefore": chain.addColumnBefore().run(); break;
      case "columnAfter": chain.addColumnAfter().run(); break;
      case "header": chain.toggleHeaderRow().run(); break;
      case "merge": chain.mergeCells().run(); break;
      case "split": chain.splitCell().run(); break;
      case "deleteRow": chain.deleteRow().run(); break;
      case "deleteColumn": chain.deleteColumn().run(); break;
      case "deleteTable": chain.deleteTable().run(); break;
    }
  }

  return <div role="group" aria-label="Article formatting" className="flex flex-wrap items-center gap-1 border-b border-[#e5e1da] bg-[#f9f8f5] p-2">
    <label className="mr-1"><span className="sr-only">Text style</span><select value={state.block} disabled={disabled} onChange={event => {
      const value = event.target.value;
      formatSelectedBlock(editor, value);
      editor.commands.focus();
    }} className="h-9 max-w-full rounded-md border border-[#e5e1da] bg-white px-2 text-xs font-semibold text-purple outline-none focus:border-purple"><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option></select></label>
    <Tool label="Bold" active={state.bold} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Tool>
    <Tool label="Italic" active={state.italic} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Tool>
    <Tool label="Underline" active={state.underline} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={16} /></Tool>
    <Tool label="Strikethrough" active={state.strike} disabled={disabled} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></Tool>
    <span aria-hidden="true" className="mx-1 h-5 border-l border-[#e5e1da]" />
    <Tool label="Bullet list" active={state.bullet} disabled={disabled} onClick={() => { formatSelectedBlock(editor, "bullet"); editor.commands.focus(); }}><List size={17} /></Tool>
    <Tool label="Numbered list" active={state.ordered} disabled={disabled} onClick={() => { formatSelectedBlock(editor, "ordered"); editor.commands.focus(); }}><ListOrdered size={17} /></Tool>
    <Tool label="Quote" active={state.quote} disabled={disabled} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Tool>
    <BlogEditorLink editor={editor} active={state.link} disabled={disabled} />
    <label className="mx-1 min-w-0 max-w-full"><span className="sr-only">Table options</span><select value="" disabled={disabled} onChange={event => { tableAction(event.target.value); event.currentTarget.value = ""; }} className="h-9 max-w-full rounded-md border border-[#e5e1da] bg-white px-2 text-xs font-semibold text-purple outline-none focus:border-purple"><option value="" disabled>Table</option><option value="insert" disabled={state.table}>Insert 3 × 3 table</option><option value="rowBefore" disabled={!state.table}>Add row above</option><option value="rowAfter" disabled={!state.table}>Add row below</option><option value="columnBefore" disabled={!state.table}>Add column before</option><option value="columnAfter" disabled={!state.table}>Add column after</option><option value="header" disabled={!state.table}>Toggle header row</option><option value="merge" disabled={!state.table || !state.merge}>Merge selected cells</option><option value="split" disabled={!state.table || !state.split}>Split cell</option><option value="deleteRow" disabled={!state.table}>Delete row</option><option value="deleteColumn" disabled={!state.table}>Delete column</option><option value="deleteTable" disabled={!state.table}>Delete table</option></select></label>
    <Tool label="Code block" active={state.code} disabled={disabled} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code size={17} /></Tool>
    <Tool label="Horizontal rule" disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={17} /></Tool>
    <Tool label="Clear formatting" disabled={disabled} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting size={17} /></Tool>
    <span aria-hidden="true" className="mx-1 h-5 border-l border-[#e5e1da]" />
    <label><span className="sr-only">Line spacing</span><select aria-label="Line spacing" disabled={disabled} value={state.lineSpacing} onChange={event => { setBlockSpacing(editor, "lineSpacing", event.target.value); editor.commands.focus(); }} className="h-9 max-w-full rounded-md border border-[#e5e1da] bg-white px-2 text-xs font-semibold text-purple"><option value="">Lines: Default</option><option value="compact">Lines: Compact</option><option value="normal">Lines: Normal</option><option value="relaxed">Lines: Relaxed</option></select></label>
    <label><span className="sr-only">Paragraph spacing</span><select aria-label="Paragraph spacing" disabled={disabled} value={state.paragraphSpacing} onChange={event => { setBlockSpacing(editor, "paragraphSpacing", event.target.value); editor.commands.focus(); }} className="h-9 max-w-full rounded-md border border-[#e5e1da] bg-white px-2 text-xs font-semibold text-purple"><option value="">Paragraph: Default</option><option value="none">Paragraph: None</option><option value="tight">Paragraph: Tight</option><option value="normal">Paragraph: Normal</option><option value="loose">Paragraph: Loose</option></select></label>
    <Tool label="Undo" disabled={disabled || !state.undo} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></Tool>
    <Tool label="Redo" disabled={disabled || !state.redo} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></Tool>
  </div>;
}
