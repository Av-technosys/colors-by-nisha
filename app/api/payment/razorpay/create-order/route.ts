import { NextResponse } from "next/server";
import { razorpay } from "@/helpers/razorpay";
import { getOrder, orderReference } from "@/helpers/orders/service";
import { minorAmount } from "@/helpers/orders/input";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { payment } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
    }

    const order = await getOrder(orderId, user.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.paidAt || order.status !== "pending") {
      return NextResponse.json({ error: "This order has already been paid or processed." }, { status: 400 });
    }

    const amountInPaise = minorAmount(order.totalAmount);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderReference(order.id),
      notes: {
        orderId: order.id,
        customerName: order.shippingName || order.user?.fullName || "",
        customerPhone: order.shippingPhone || order.user?.mobile || "",
        customerEmail: order.user?.email || "",
      },
    });

    try {
      await db.insert(payment).values({
        orderId: order.id,
        paymentOrderId: rzpOrder.id,
        paymentAmount: amountInPaise,
        paymentStatus: "pending",
        paymentMeta: { receipt: orderReference(order.id) },
      });
    } catch (insertErr) {
      console.warn("Could not insert pending payment record:", insertErr);
    }

    return NextResponse.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderId: order.id,
      orderReference: orderReference(order.id),
      customer: {
        name: order.shippingName || order.user?.fullName || "",
        email: order.user?.email || "",
        phone: order.shippingPhone || order.user?.mobile || "",
      },
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to initiate payment with Razorpay." },
      { status: 500 }
    );
  }
}

