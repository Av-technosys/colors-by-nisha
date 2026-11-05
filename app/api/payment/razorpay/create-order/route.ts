import { rateLimit } from "@/helpers/security/requests";
import { auth } from "@clerk/nextjs/server";
import { orderError, readOrderRequest } from "@/helpers/orders/http";
import { OrderInputError } from "@/helpers/orders/input";
import { prepareOrderPayment } from "@/helpers/payments/service";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Please sign in to pay." }, { status: 401 });
  try {
    rateLimit(`payment-create:${userId}`, 15);
    const body = await readOrderRequest(request);
    if (typeof body.orderId !== "string") throw new OrderInputError("Invalid order reference.");
    const result = await prepareOrderPayment(body.orderId, userId);
    return Response.json(result, { status: !result.paid && !("razorpayOrderId" in result) ? 202 : 200 });
  } catch (error) { return orderError(error, "Payment could not be started. Your order is saved. Please try again."); }
}
