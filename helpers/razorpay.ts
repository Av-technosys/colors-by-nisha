import "server-only";

import Razorpay from "razorpay";
import { validPaymentSignature } from "@/helpers/payments/signature";

let client: Razorpay | undefined;

export function razorpayKeyId() {
  const key = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key || !process.env.RAZORPAY_KEY_SECRET) throw new Error("Payment configuration is unavailable.");
  return key;
}
export function getRazorpayClient() {
  client ??= new Razorpay({ key_id: razorpayKeyId(), key_secret: process.env.RAZORPAY_KEY_SECRET! });
  return client;
}
export function verifyRazorpaySignature(input: { orderId: string; paymentId: string; signature: string }) {
  return validPaymentSignature(`${input.orderId}|${input.paymentId}`, input.signature, process.env.RAZORPAY_KEY_SECRET);
}
export function verifyRazorpayWebhookSignature(input: { body: string; signature: string }) {
  return validPaymentSignature(input.body, input.signature, process.env.RAZORPAY_WEBHOOK_SECRET);
}
