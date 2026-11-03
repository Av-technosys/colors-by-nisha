export const MAX_BLOG_CONTENT_LENGTH = 100000;

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function blogContentToHtml(content: string) {
  if (/^\s*<(?:\/?[a-z][\w:-]*\b|!--)/i.test(content)) return content;
  return content.trim().split(/\n\s*\n/).filter(Boolean).map(block => {
    const heading = /^(#{1,6})\s+(.+)$/.exec(block);
    if (heading) {
      const level = Math.min(4, Math.max(2, heading[1].length));
      return `<h${level}>${escapeHtml(heading[2])}</h${level}>`;
    }
    const lines = block.split("\n");
    if (lines.every(line => /^-\s/.test(line))) return `<ul>${lines.map(line => `<li><p>${escapeHtml(line.replace(/^-\s/, ""))}</p></li>`).join("")}</ul>`;
    if (lines.every(line => /^\d+\.\s/.test(line))) return `<ol>${lines.map(line => `<li><p>${escapeHtml(line.replace(/^\d+\.\s/, ""))}</p></li>`).join("")}</ol>`;
    return `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

export function getBlogContentText(content: string) {
  return content.replace(/<[^>]*>/g, " ")
    .replace(/&(nbsp|#0*160|#x0*a0|#0*32|#x0*20|ZeroWidthSpace|#0*8203|#x0*200b);/gi, " ")
    .replace(/[\u200b-\u200d\uFEFF]/g, "")
    .replace(/&(?:amp|lt|gt|quot|apos|#39);/gi, "x")
    .replace(/\s+/g, " ").trim();
}

export function normalizeBlogLink(input: string): string | null {
  const value = input.trim();
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
  if (value.startsWith("//")) return null;
  if (value.startsWith("#")) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  const explicitProtocol = /^[a-z][a-z\d+.-]*:/i.test(value);
  const url = explicitProtocol ? value : `https://${value}`;
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol) && parsed.hostname && !parsed.username && !parsed.password) return parsed.href;
    if (parsed.protocol === "mailto:" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.pathname)) return parsed.href;
    if (parsed.protocol === "tel:" && /^\+?[\d()-]+$/.test(parsed.pathname)) return parsed.href;
  } catch { return null; }
  return null;
}
