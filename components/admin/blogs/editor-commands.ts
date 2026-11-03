import { Extension, type Command, type Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import { canSplit } from "@tiptap/pm/transform";

export const BlogSpacing = Extension.create({
  name: "blogSpacing",
  addGlobalAttributes() {
    return ["paragraph", "heading"].map(type => ({ types: [type], attributes: {
      lineSpacing: {
        default: null,
        parseHTML: element => element.getAttribute("data-line-spacing"),
        renderHTML: attributes => attributes.lineSpacing ? { "data-line-spacing": attributes.lineSpacing } : {},
      },
      paragraphSpacing: {
        default: type === "paragraph" ? "tight" : null,
        parseHTML: element => element.getAttribute("data-paragraph-spacing") ?? (type === "paragraph" ? "tight" : null),
        renderHTML: attributes => attributes.paragraphSpacing ? { "data-paragraph-spacing": attributes.paragraphSpacing } : {},
      },
    } }));
  },
});

const isolateSelection = (splitLines: boolean): Command => ({ tr, dispatch }) => {
  if (!(tr.selection instanceof TextSelection)) return true;
  const original = tr.selection;
  let { from, to } = original;
  if (original.empty) {
    const { $from } = original;
    from = $from.start(); to = $from.end();
    $from.parent.forEach((node, offset) => {
      if (node.type.name !== "hardBreak") return;
      const position = $from.start() + offset;
      if (position < original.from) from = position + 1;
      else if (to === $from.end()) to = position;
    });
  }
  while (from < to && tr.doc.nodeAt(from)?.type.name === "hardBreak") from++;
  while (to > from && tr.doc.nodeAt(to - 1)?.type.name === "hardBreak") to--;
  if (!dispatch || from >= to) return true;
  const mappingStart = tr.mapping.maps.length;
  const mapped = (position: number, bias: number) => tr.mapping.slice(mappingStart).map(position, bias);
  const split = (position: number, side?: "before" | "after") => {
    const point = tr.doc.resolve(position);
    if (!point.parent.isTextblock || point.parentOffset === 0 || point.parentOffset === point.parent.content.size) return;
    const heading = point.parent.type.name === "heading";
    const depth = point.depth > 1 && point.node(point.depth - 1).type.name === "listItem" && canSplit(tr.doc, position, 2) ? 2 : 1;
    if (!canSplit(tr.doc, position, depth)) return;
    tr.split(position, depth);
    if (heading && side) {
      const outside = TextSelection.near(tr.doc.resolve(side === "after" ? position + depth : position), side === "after" ? 1 : -1).$from;
      if (outside.parent.type.name === "heading") tr.setNodeMarkup(outside.before(), tr.doc.type.schema.nodes.paragraph, { paragraphSpacing: "tight" });
    }
  };
  let end = mapped(to, -1);
  if (tr.doc.nodeAt(end)?.type.name === "hardBreak") tr.delete(end, end + 1);
  split(mapped(to, -1), "after");
  let start = mapped(from, 1);
  if (tr.doc.nodeAt(start - 1)?.type.name === "hardBreak") tr.delete(start - 1, start);
  split(mapped(from, 1), "before");
  if (splitLines) {
    const breaks: number[] = [];
    tr.doc.nodesBetween(mapped(from, 1), mapped(to, -1), (node, pos) => { if (node.type.name === "hardBreak") breaks.push(pos); });
    for (const position of breaks.reverse()) { tr.delete(position, position + 1); split(position); }
  }
  start = mapped(from, 1); end = mapped(to, -1);
  tr.setSelection(original.empty ? TextSelection.near(tr.doc.resolve(mapped(original.from, 1))) : TextSelection.between(tr.doc.resolve(start), tr.doc.resolve(end)));
  return true;
};

export function formatSelectedBlock(editor: Editor, format: string) {
  const list = format === "bullet" || format === "ordered";
  const chain = editor.chain().command(isolateSelection(list));
  if (list) return (format === "bullet" ? chain.toggleBulletList() : chain.toggleOrderedList()).run();
  if (editor.isActive("listItem")) chain.liftListItem("listItem");
  return (format === "p" ? chain.setParagraph() : chain.setHeading({ level: Number(format.slice(1)) as 2 | 3 | 4 })).run();
}

export function setBlockSpacing(editor: Editor, attribute: "lineSpacing" | "paragraphSpacing", value: string) {
  return editor.chain().command(({ tr, dispatch }) => {
    if (!dispatch) return true;
    const { from, to } = tr.selection;
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (["paragraph", "heading"].includes(node.type.name)) tr.setNodeMarkup(pos, undefined, { ...node.attrs, [attribute]: value || null });
    });
    return true;
  }).run();
}
