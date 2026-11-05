import { checkOrigin, rateLimit } from "@/helpers/security/requests";
import { auth } from "@clerk/nextjs/server";
import { reconcileOrderPayment } from "@/helpers/payments/service";
import { orderError } from "@/helpers/orders/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401 });
  try {
    checkOrigin(_request);
    rateLimit(`payment-status:${userId}`, 60);
    const { id } = await context.params;
    return Response.json(await reconcileOrderPayment(id, userId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return orderError(error, "Payment status is temporarily unavailable. Please try again."); }
}
