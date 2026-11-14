import { clientKey, rateLimit, readJson, RequestError } from "@/helpers/security/requests";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    rateLimit(`subscribe:${clientKey(request.headers)}`, 5, 5 * 60_000);
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new RequestError("Please enter a valid email address.");
    }
    await db.insert(subscriptions).values({ email }).onConflictDoNothing({ target: subscriptions.email });
    return Response.json({ message: "Thank you for subscribing! You're on our newsletter list." }, { headers });
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, {
        status: error.status,
        headers: { ...headers, ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) },
      });
    }
    console.error("Unable to save newsletter subscription:", error);
    return Response.json({ error: "Unable to subscribe right now. Please try again." }, { status: 500, headers });
  }
}
