import { checkOrigin, rateLimit } from "@/helpers/security/requests";
import { orderError } from "@/helpers/orders/http";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/helpers/auth/users";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  try {
    checkOrigin(request); rateLimit(`profile-sync:${user.id}`, 20);
    const record = await syncUser(user);
    if (!record || record.deletedAt) return Response.json({ error: "Account unavailable." }, { status: 403 });
    return Response.json({ synced: true });
  } catch (error) {
    return orderError(error, "Your account is signed in, but your details could not be saved. Please try again.");
  }
}
