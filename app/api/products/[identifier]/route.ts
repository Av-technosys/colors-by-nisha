import { getCatalogProduct } from "@/helpers/store/products";

export async function GET(_request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  if (!identifier.trim() || identifier.length > 255) return Response.json({ error: "Invalid product." }, { status: 400 });
  try {
    const product = await getCatalogProduct(identifier.trim());
    return product ? Response.json({ product }, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "This product is currently unavailable for online checkout." }, { status: 404 });
  } catch { return Response.json({ error: "Product options could not be loaded. Please try again." }, { status: 503 }); }
}
