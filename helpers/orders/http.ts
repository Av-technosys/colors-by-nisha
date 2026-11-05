import { AccountInputError } from "@/helpers/auth/account";
import { OrderInputError } from "./input";
import { readJson, RequestError } from "@/helpers/security/requests";

export async function readOrderRequest(request: Request): Promise<Record<string, unknown>> {
  return readJson(request);
}
export function orderError(error: unknown, fallback = "Your order could not be saved. Please try again shortly.") {
  const invalid = error instanceof OrderInputError || error instanceof AccountInputError || error instanceof SyntaxError || error instanceof RequestError;
  if (!invalid) console.error("Order request failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json({ error: invalid ? error instanceof SyntaxError ? "Please check your details and try again." : (error as Error).message : fallback, ...(error instanceof OrderInputError && error.code === "price_changed" ? { code: "price_changed" } : {}) }, {
    status: error instanceof RequestError ? error.status : invalid ? 400 : 503,
    headers: { "Cache-Control": "no-store", ...(error instanceof RequestError && error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) },
  });
}
