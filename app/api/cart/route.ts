import { quoteCart } from "@/helpers/orders/service";
import { orderError, readOrderRequest } from "@/helpers/orders/http";

export async function POST(request: Request) {
  try {
    const body = await readOrderRequest(request);
    return Response.json(await quoteCart(body.items), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return orderError(error); }
}
