import { adminAccessError } from "@/helpers/auth/access";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { imageUrl } from "@/helpers/storage/s3";
import { decodeBannerImage } from "@/helpers/admin/blog-images";
import { validateId } from "@/helpers/admin/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminAccessError();
  if (denied) return denied;
  const { id } = await params;
  try { validateId(id); } catch { return new Response(null, { status: 404 }); }
  try {
    const [blog] = await db.select({ image: blogs.mainBannerImage }).from(blogs).where(eq(blogs.id, id)).limit(1);
    if (!blog) return new Response(null, { status: 404 });
    if (!blog.image.startsWith("data:")) {
      return new Response(null, { status: 307, headers: {
        Location: new URL(await imageUrl(blog.image), request.url).href,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      } });
    }
    const image = decodeBannerImage(blog.image);
    if (!image) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(image.bytes), { headers: {
      "Content-Type": image.type,
      "Content-Length": String(image.bytes.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
