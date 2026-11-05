import { createHmac, timingSafeEqual } from "node:crypto";

export function validPaymentSignature(message: string, signature: string, secret: string | undefined) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(createHmac("sha256", secret).update(message).digest(), Buffer.from(signature, "hex"));
}
