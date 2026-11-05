import { readText } from "@/helpers/security/requests";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { payment } from "@/lib/db/schema";
import { verifyRazorpayWebhookSignature } from "@/helpers/razorpay";
import { settleGatewayPayment } from "@/helpers/payments/service";
import { orderError } from "@/helpers/orders/http";

export async function POST(request: Request) {
  try {
    const body = await readText(request, 1_000_000);
    if (body.length > 1000000 || !verifyRazorpayWebhookSignature({ body, signature: request.headers.get("x-razorpay-signature") || "" })) return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
    const event = JSON.parse(body);
    const entity = event.payload?.payment?.entity;
    if (["payment.captured", "order.paid"].includes(event.event) && entity?.status === "captured") await settleGatewayPayment(entity);
    else if (event.event === "payment.failed" && typeof entity?.order_id === "string") await db.update(payment).set({ paymentStatus: "failed" }).where(and(eq(payment.paymentOrderId, entity.order_id), ne(payment.paymentStatus, "captured")));
    return Response.json({ received: true });
  } catch (error) { return orderError(error, "Webhook processing failed."); }
}
