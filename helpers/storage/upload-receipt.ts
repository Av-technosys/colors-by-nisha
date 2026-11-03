import "server-only";

import { imageKeyPrefix } from "./image-path";
import { createHmac, timingSafeEqual } from "node:crypto";

type UploadReceipt = { key: string; folder: "products" | "blogs"; expires: number };

function signingSecret() {
  const secret = process.env.IMAGE_UPLOAD_SECRET;
  if (!secret || secret.length < 32) throw new Error("Add IMAGE_UPLOAD_SECRET with at least 32 random characters to the environment.");
  return secret;
}

export function checkUploadConfiguration() {
  signingSecret();
}

export function createUploadReceipt(key: string, folder: "products" | "blogs") {
  const payload = Buffer.from(JSON.stringify({ key, folder, expires: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readUploadReceipt(token: string, folder: "products" | "blogs") {
  const message = "This image upload is missing or expired. Please re-upload the image.";
  if (!token || token.length > 2048) throw new Error(message);
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error(message);
  const [payload, signature] = parts;
  const expected = createHmac("sha256", signingSecret()).update(payload).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new Error(message);
  let receipt: UploadReceipt;
  try { receipt = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); }
  catch { throw new Error(message); }
  if (receipt.folder !== folder || !Number.isFinite(receipt.expires) || receipt.expires < Date.now() || typeof receipt.key !== "string" || !receipt.key.startsWith(imageKeyPrefix(folder))) throw new Error(message);
  return receipt.key;
}
