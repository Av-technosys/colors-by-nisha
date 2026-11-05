import { rateLimit } from "@/helpers/security/requests";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payment } from "@/lib/db/schema";
import { getRazorpayClient, verifyRazorpaySignature } from "@/helpers/razorpay";
import { ownedPaymentOrder, settleGatewayPayment } from "@/helpers/payments/service";
import { orderError, readOrderRequest } from "@/helpers/orders/http";
import { OrderInputError } from "@/helpers/orders/input";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Please sign in to confirm payment." }, { status: 401 });
  try {
    rateLimit(`payment-verify:${userId}`, 30);
    const body = await readOrderRequest(request);
    const { orderId, razorpay_order_id: gatewayId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
    if (typeof orderId !== "string" || typeof gatewayId !== "string" || !/^order_[a-zA-Z0-9]+$/.test(gatewayId) || typeof paymentId !== "string" || !/^pay_[a-zA-Z0-9]+$/.test(paymentId) || typeof signature !== "string") throw new OrderInputError("We couldn’t confirm this payment. Please check your order and try again.");
    await ownedPaymentOrder(orderId, userId);
    const [attempt] = await db.select().from(payment).where(and(eq(payment.orderId, orderId), eq(payment.paymentOrderId, gatewayId))).limit(1);
    if (!attempt?.paymentOrderId || !verifyRazorpaySignature({ orderId: attempt.paymentOrderId, paymentId, signature })) throw new OrderInputError("Payment confirmation does not match this order.");
    const entity = await getRazorpayClient().payments.fetch(paymentId);
    if (entity.order_id !== attempt.paymentOrderId || Number(entity.amount) !== attempt.paymentAmount || entity.currency !== "INR") throw new OrderInputError("Payment details do not match this order.");
    if (entity.status !== "captured") return Response.json({ paid: false, orderId, pending: true }, { status: 202 });
    const result = await settleGatewayPayment(entity);
    return Response.json({ paid: true, orderId, status: result.order.status, requiresAttention: result.requiresAttention });
  } catch (error) { return orderError(error, "Payment is being checked. View your order for the latest status."); }
}
