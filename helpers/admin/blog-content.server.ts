import "server-only";

import sanitizeHtml from "sanitize-html";
import { blogContentToHtml, normalizeBlogLink } from "./blog-content";

export function sanitizeBlogContent(content: string) {
  return sanitizeHtml(blogContentToHtml(content), {
    allowedTags: ["h2", "h3", "h4", "p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "a", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "hr", "code", "pre"],
    allowedAttributes: { ...Object.fromEntries(["p", "h2", "h3", "h4"].map(tag => [tag, [{ name: "data-line-spacing", values: ["compact", "normal", "relaxed"] }, { name: "data-paragraph-spacing", values: ["none", "tight", "normal", "loose"] }]])), a: ["href", "target", "rel"], ol: ["start"], td: ["colspan", "rowspan"], th: ["colspan", "rowspan", "scope"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    exclusiveFilter: frame => frame.tag === "a" && !frame.attribs.href ? "excludeTag" : false,
    transformTags: {
      "*": (tagName, attributes) => {
        const attribs = { ...attributes };
        if (!["compact", "normal", "relaxed"].includes(attribs["data-line-spacing"])) delete attribs["data-line-spacing"];
        if (!["none", "tight", "normal", "loose"].includes(attribs["data-paragraph-spacing"])) delete attribs["data-paragraph-spacing"];
        return { tagName, attribs };
      },
      h1: "h2", h5: "h4", h6: "h4", b: "strong", i: "em", strike: "s",
      a: (_tag, attributes) => {
        const href = normalizeBlogLink(attributes.href ?? "");
        return { tagName: "a", attribs: href ? { href, ...(attributes.target === "_blank" ? { target: "_blank", rel: "noopener noreferrer" } : {}) } : {} };
      },
      td: (_tag, attributes) => ({ tagName: "td", attribs: cellAttributes(attributes) }),
      th: (_tag, attributes) => ({ tagName: "th", attribs: { ...cellAttributes(attributes), ...(["row", "col"].includes(attributes.scope) ? { scope: attributes.scope } : {}) } }),
    },
  });
}

function cellAttributes(attributes: Record<string, string>) {
  const result: Record<string, string> = {};
  for (const key of ["colspan", "rowspan"]) {
    const value = Number(attributes[key]);
    if (Number.isInteger(value) && value > 0 && value <= 100) result[key] = String(value);
  }
  return result;
}
