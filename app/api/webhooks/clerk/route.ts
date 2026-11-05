import { NextRequest } from "next/server";
import { readText, RequestError } from "@/helpers/security/requests";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { markUserDeleted, syncClerkUser } from "@/helpers/auth/users";

export async function POST(request: NextRequest) {
  let event;
  try {
    const body = await readText(request, 1_000_000);
    event = await verifyWebhook(new NextRequest(request.url, { method: request.method, headers: request.headers, body }));
  } catch (error) {
    return Response.json({ error: "We couldn’t verify this request." }, { status: error instanceof RequestError ? error.status : 400 });
  }
  try {
    if (event.type === "user.created" || event.type === "user.updated") await syncClerkUser(event.data.id);
    if (event.type === "user.deleted" && event.data.id) await markUserDeleted(event.data.id);
    return Response.json({ received: true });
  } catch {
    console.error("Clerk user sync failed.");
    return Response.json({ error: "User synchronization failed." }, { status: 500 });
  }
}
