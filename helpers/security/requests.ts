import "server-only";

import { createHash } from "node:crypto";

export class RequestError extends Error {
  constructor(message: string, public status = 400, public retryAfter?: number) { super(message); }
}

export function checkOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const expected = new URL(request.url).origin;
  if (site === "cross-site" || site === "same-site") throw new RequestError("Please refresh the page and try again.", 403);
  if (origin && origin !== expected) throw new RequestError("Please refresh the page and try again.", 403);
  if (!origin && referer) {
    try { if (new URL(referer).origin === expected) return; } catch { /* Invalid referrer */ }
    throw new RequestError("Please refresh the page and try again.", 403);
  }
}

export async function readText(request: Request, limit = 32_000) {
  if (Number(request.headers.get("content-length")) > limit) throw new RequestError("There’s too much information to send at once. Please try a smaller request.", 413);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new RequestError("There’s too much information to send at once. Please try a smaller request.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { throw new RequestError("Please check your details and try again."); }
}

export async function readJson(request: Request) {
  checkOrigin(request);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new RequestError("Please refresh the page and try again.", 415);
  let value: unknown;
  try { value = JSON.parse(await readText(request)); }
  catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError("Please check your details and try again.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RequestError("Please check your details and try again.");
  return value as Record<string, unknown>;
}

const requests = new Map<string, { count: number; expires: number }>();

export function rateLimit(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  let entry = requests.get(key);
  if (!entry || entry.expires <= now) {
    if (requests.size >= 10_000) {
      for (const [id, value] of requests) if (value.expires <= now) requests.delete(id);
      if (requests.size >= 10_000) throw new RequestError("Please wait a moment before trying again.", 429, 60);
    }
    entry = { count: 0, expires: now + windowMs };
    requests.set(key, entry);
  }
  if (++entry.count > limit) throw new RequestError("Please wait a moment before trying again.", 429, Math.ceil((entry.expires - now) / 1000));
}

export function clientKey(headers: Headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip.slice(0, 200)).digest("hex").slice(0, 24);
}
