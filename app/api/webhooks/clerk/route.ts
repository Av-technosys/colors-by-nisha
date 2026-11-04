import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { markUserDeleted, syncClerkUser } from "@/helpers/auth/users";

export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
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
