import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { imageUrl } from "@/helpers/storage/s3";
import { decodeBannerImage } from "@/helpers/admin/blog-images";
import { isUuid } from "@/helpers/orders/input";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return new Response(null, { status: 404 });
  try {
    const [blog] = await db.select({ image: blogs.mainBannerImage }).from(blogs).where(and(eq(blogs.id, id), eq(blogs.isDraft, false))).limit(1);
    if (!blog) return new Response(null, { status: 404 });
    if (!blog.image.startsWith("data:")) return new Response(null, { status: 307, headers: { Location: new URL(await imageUrl(blog.image), request.url).href, "Cache-Control": "no-store" } });
    const image = decodeBannerImage(blog.image);
    if (!image) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(image.bytes), { headers: { "Content-Type": image.type, "Content-Length": String(image.bytes.length), "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } });
  } catch { return new Response(null, { status: 503 }); }
}
