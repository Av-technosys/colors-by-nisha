import { randomUUID } from "node:crypto";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { AccountInputError, parseAddress, parseContact, readAccount, removeAddress, saveAddress } from "@/helpers/auth/account";
import { syncUser } from "@/helpers/auth/users";

function checkMetadataSize(value: unknown) {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 7500) throw new AccountInputError("Your saved details have reached their limit. Remove an unused address and try again.");
}

export async function PATCH(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AccountInputError("Invalid account details.");
    const client = await clerkClient();
    if (body.action === "profile") {
      const contact = parseContact(body);
      checkMetadataSize({ private: user.privateMetadata, public: user.publicMetadata, unsafe: { ...user.unsafeMetadata, ...contact } });
      const updated = await client.users.updateUserMetadata(user.id, { unsafeMetadata: contact });
      const record = await syncUser(updated);
      if (!record || record.deletedAt) return Response.json({ error: "Account unavailable." }, { status: 403 });
      return Response.json({ account: readAccount(updated) });
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
    const account = readAccount(user);
    let addresses = account.addresses;
    if (body.action === "save-address") {
      if (!body.address || typeof body.address !== "object" || Array.isArray(body.address)) throw new AccountInputError("Invalid address.");
      const existingId = typeof body.address.id === "string" ? body.address.id : "";
      if (existingId && !addresses.some(item => item.id === existingId)) throw new AccountInputError("This address is no longer available.");
      addresses = saveAddress(addresses, parseAddress(body.address, existingId || randomUUID()));
    } else if (body.action === "delete-address" || body.action === "default-address") {
      if (!addresses.some(item => item.id === body.id)) throw new AccountInputError("This address is no longer available.");
      addresses = body.action === "delete-address" ? removeAddress(addresses, body.id) : addresses.map(item => ({ ...item, isDefault: item.id === body.id }));
    } else throw new AccountInputError("Invalid account action.");
    const metadata = { ...user.privateMetadata, account: { ...(typeof user.privateMetadata.account === "object" && user.privateMetadata.account !== null ? user.privateMetadata.account : {}), addresses } };
    checkMetadataSize({ private: metadata, public: user.publicMetadata, unsafe: user.unsafeMetadata });
    const updated = await client.users.updateUserMetadata(user.id, { privateMetadata: { account: { addresses } } });
    return Response.json({ account: readAccount(updated) });
  } catch (error) {
    const invalid = error instanceof AccountInputError || error instanceof SyntaxError;
    return Response.json({ error: error instanceof AccountInputError ? error.message : invalid ? "Invalid account details." : "Your changes could not be saved. Please try again." }, { status: invalid ? 400 : 503 });
  }
}
