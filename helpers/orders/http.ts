import { AccountInputError } from "@/helpers/auth/account";
import { OrderInputError } from "./input";

export async function readOrderRequest(request: Request): Promise<Record<string, unknown>> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new OrderInputError("Invalid request origin.");
  if (Number(request.headers.get("content-length")) > 32000) throw new OrderInputError("The request is too large.");
  const text = await request.text();
  if (text.length > 32000) throw new OrderInputError("The request is too large.");
  const body = JSON.parse(text);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new OrderInputError("Invalid request.");
  return body;
}
export function orderError(error: unknown) {
  const invalid = error instanceof OrderInputError || error instanceof AccountInputError || error instanceof SyntaxError;
  if (!invalid) console.error("Order request failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json({ error: invalid ? error instanceof SyntaxError ? "Invalid request." : (error as Error).message : "Your order could not be saved. Please try again shortly." }, { status: invalid ? 400 : 503 });
}
