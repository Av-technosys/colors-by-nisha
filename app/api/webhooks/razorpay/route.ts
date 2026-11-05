import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/helpers/razorpay";
import { confirmOrderPayment, getOrder } from "@/helpers/orders/service";
import { db } from "@/lib/db";
import { payment } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature header." }, { status: 400 });
    }

    const rawBody = await request.text();

    const isValid = verifyRazorpayWebhookSignature({
      body: rawBody,
      signature,
    });

    if (!isValid) {
      console.warn("Invalid Razorpay webhook signature attempt.");
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const paymentId = paymentEntity?.id;
      const internalOrderId = paymentEntity?.notes?.orderId || orderEntity?.notes?.orderId;
      const amountMinor = paymentEntity?.amount || orderEntity?.amount;
      const currency = paymentEntity?.currency || orderEntity?.currency || "INR";

      if (internalOrderId && paymentId && amountMinor) {
        const order = await getOrder(internalOrderId);
        if (order && !order.paidAt) {
          await confirmOrderPayment({
            orderId: internalOrderId,
            paymentId,
            amountMinor: Number(amountMinor),
            currency,
          });

          try {
            await db.insert(payment).values({
              orderId: internalOrderId,
              paymentId,
              paymentOrderId: orderEntity?.id || null,
              paymentStatus: "captured",
              paymentMethod: paymentEntity?.method || "webhook",
              paymentAmount: Number(amountMinor),
              paymentMeta: event,
            });
          } catch (webhookDbErr) {
            console.warn("Could not record webhook payment row in db:", webhookDbErr);
          }
          console.log(`Razorpay webhook: Order ${internalOrderId} confirmed with payment ${paymentId}`);
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const internalOrderId = paymentEntity?.notes?.orderId;
      console.warn(`Razorpay webhook: Payment failed for order ${internalOrderId}: ${paymentEntity?.error_description}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed." },
      { status: 500 }
    );
  }
}
