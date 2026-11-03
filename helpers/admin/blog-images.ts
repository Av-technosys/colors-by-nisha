import "server-only";

import { MAX_BANNER_BYTES } from "@/components/admin/blogs/blog-fields";

function imageType(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))) return "image/gif";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export function decodeBannerImage(value: string) {
  if (value.length > Math.ceil(MAX_BANNER_BYTES / 3) * 4 + 64) return null;
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return null;
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_BANNER_BYTES || bytes.toString("base64") !== match[2] || imageType(bytes) !== match[1]) return null;
  return { bytes, type: match[1] };
}
