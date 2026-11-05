import { adminAccessError } from "@/helpers/auth/access";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productMedia } from "@/lib/db/schema";
import { imageUrl } from "@/helpers/storage/s3";
import { validateId } from "@/helpers/admin/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminAccessError();
  if (denied) return denied;
  const { id } = await params;
  try { validateId(id); } catch { return new Response(null, { status: 404 }); }
  try {
    const [image] = await db.select({ key: productMedia.key }).from(productMedia).where(eq(productMedia.id, id)).limit(1);
    if (!image) return new Response(null, { status: 404 });
    return new Response(null, { status: 307, headers: {
      Location: new URL(await imageUrl(image.key), request.url).href,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
