import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/helpers/razorpay";
import { confirmOrderPayment, getOrder, orderReference } from "@/helpers/orders/service";
import { minorAmount } from "@/helpers/orders/input";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment verification details." }, { status: 400 });
    }

    const order = await getOrder(orderId, user.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Payment verification failed: Invalid signature." }, { status: 400 });
    }

    const amountMinor = minorAmount(order.totalAmount);

    const result = await confirmOrderPayment({
      orderId: order.id,
      paymentId: razorpay_payment_id,
      amountMinor,
      currency: "INR",
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderReference: orderReference(order.id),
      status: result.order.status,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment confirmation failed." },
      { status: 500 }
    );
  }
}

