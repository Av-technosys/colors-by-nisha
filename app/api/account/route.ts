import { readJson, rateLimit } from "@/helpers/security/requests";
import { orderError } from "@/helpers/orders/http";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { AccountInputError, parseContact } from "@/helpers/auth/account";
import { getCustomerAccount, changeCustomerAddress } from "@/helpers/auth/addresses";
import { revalidatePath } from "next/cache";
import { syncUser } from "@/helpers/auth/users";

function checkMetadataSize(value: unknown) {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 7500) throw new AccountInputError("Your saved details have reached their limit. Remove an unused address and try again.");
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in to use your saved addresses." }, { status: 401 });
  try { rateLimit(`account-read:${user.id}`, 120); return Response.json((await getCustomerAccount(user)).account, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return orderError(error, "Your account could not be loaded. Please try again."); }
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  try {
    rateLimit(`account-write:${user.id}`, 30);
    const body = await readJson(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AccountInputError("Invalid account details.");
    const client = await clerkClient();
    if (body.action === "profile") {
      const contact = parseContact(body);
      checkMetadataSize({ private: user.privateMetadata, public: user.publicMetadata, unsafe: { ...user.unsafeMetadata, ...contact } });
      const updated = await client.users.updateUserMetadata(user.id, { unsafeMetadata: contact });
      const record = await syncUser(updated);
      if (!record || record.deletedAt) return Response.json({ error: "Account unavailable." }, { status: 403 });
      revalidatePath("/dashboard");
      revalidatePath("/checkout");
      return Response.json({ account: (await getCustomerAccount(updated)).account });
    }
    if (body.action === "sign-out-all") {
      const { sessionId } = await auth();
      const sessionIds: string[] = [];
      let offset = 0;
      while (true) {
        const sessions = await client.sessions.getSessionList({ userId: user.id, status: "active", limit: 100, offset });
        sessionIds.push(...sessions.data.map(session => session.id).filter(id => id !== sessionId));
        offset += sessions.data.length;
        if (offset >= sessions.totalCount || !sessions.data.length) break;
      }
      await Promise.all(sessionIds.map(id => client.sessions.revokeSession(id)));
      return Response.json({ success: true });
    }
    if (typeof body.action !== "string" || !["save-address", "delete-address", "default-address"].includes(body.action)) throw new AccountInputError("Invalid account action.");
    const { userId, account } = await getCustomerAccount(user);
    const addresses = await changeCustomerAddress(userId, body);
    revalidatePath("/dashboard");
    revalidatePath("/checkout");
    return Response.json({ account: { ...account, addresses } });
  } catch (error) {
    return orderError(error, "Your changes could not be saved. Please try again.");
  }
}
