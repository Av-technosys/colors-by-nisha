import { NextResponse } from "next/server";
import { getShopProducts } from "@/helpers/store/products";
import { productsData } from "@/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";

  try {
    const dbProducts = await getShopProducts();
    const list = dbProducts && dbProducts.length > 0 ? dbProducts : productsData;

    if (!q) {
      return NextResponse.json({ products: list });
    }

    const filtered = list.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.collection && p.collection.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });

    return NextResponse.json({ products: filtered });
  } catch (err) {
    if (!q) {
      return NextResponse.json({ products: productsData });
    }
    const filtered = productsData.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.collection && p.collection.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });
    return NextResponse.json({ products: filtered });
  }
}
