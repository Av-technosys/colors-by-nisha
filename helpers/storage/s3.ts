import "server-only";

import { randomUUID } from "node:crypto";
import { DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { imageKeyPrefix } from "./image-path";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "./image-limits";

function storage() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) throw new Error("Image storage is not configured. Add AWS_REGION and AWS_S3_BUCKET to the environment.");
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) throw new Error("Add both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to the environment.");
  const client = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey, sessionToken: process.env.AWS_SESSION_TOKEN } } : {}),
  });
  return { client, bucket };
}

function imageType(bytes: Buffer) {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"))) return "image/gif";
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function validateImage(file: File, maxBytes = MAX_IMAGE_BYTES) {
  if (!file.size || file.size > maxBytes) throw new Error(`Choose an image no larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Choose a JPG, PNG, WebP, or GIF image.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > maxBytes || imageType(bytes) !== file.type) throw new Error("This file is not a valid supported image.");
  return bytes;
}

export async function uploadImage(file: File, folder: "products" | "blogs", maxBytes = MAX_IMAGE_BYTES) {
  const bytes = await validateImage(file, maxBytes);
  const { client, bucket } = storage();
  const extension = file.type.replace("image/", "").replace("jpeg", "jpg");
  const name = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
  const key = `${imageKeyPrefix(folder)}${randomUUID()}-${name}.${extension}`;
  try {
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: file.type, CacheControl: "public, max-age=31536000, immutable" }));
    return key;
  } catch {
    throw new Error("The image could not be uploaded. Check the S3 configuration and try again.");
  } finally {
    client.destroy();
  }
}

export async function imageUrl(key: string) {
  if (/^https?:\/\//i.test(key) || key.startsWith("/")) return key;
  const publicUrl = process.env.AWS_S3_PUBLIC_URL?.replace(/\/$/, "");
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  if (publicUrl) return `${publicUrl}/${encodedKey}`;
  const { client, bucket } = storage();
  try {
    return await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 });
  } finally {
    client.destroy();
  }
}

export async function deleteImages(keys: string[]) {
  const ownedKeys = [...new Set(keys)].filter(key => key.startsWith(imageKeyPrefix("products")) || key.startsWith(imageKeyPrefix("blogs")));
  if (!ownedKeys.length) return;
  try {
    const { client, bucket } = storage();
    try {
      const result = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: ownedKeys.map(Key => ({ Key })), Quiet: true } }));
      if (result.Errors?.length) console.error("Some removed images could not be cleaned up from S3.");
    } finally {
      client.destroy();
    }
  } catch {
    console.error("Removed images could not be cleaned up from S3.");
  }
}

export async function confirmImageUpload(key: string) {
  if (!key.startsWith(imageKeyPrefix("products")) && !key.startsWith(imageKeyPrefix("blogs"))) return;
  const { client, bucket } = storage();
  try {
    const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (!result.ContentLength || !result.ContentType || !IMAGE_TYPES.includes(result.ContentType)) throw new Error("Invalid image");
  } catch {
    throw new Error("The image could not be verified in storage. Please re-upload the image.");
  } finally {
    client.destroy();
  }
}
