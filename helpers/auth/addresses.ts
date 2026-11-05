import "server-only";

import { randomUUID } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { addresses, users } from "@/lib/db/schema";
import { isUuid } from "@/helpers/orders/input";
import { AccountInputError, parseAddress, readAccount, removeAddress, saveAddress, type SavedAddress } from "./account";
import { syncUser } from "./users";

type AccountUser = Parameters<typeof readAccount>[0];
type AddressRow = typeof addresses.$inferSelect;

function toAddress(row: AddressRow): SavedAddress {
  return { id: row.id, fullName: row.fullName, phone: row.phone, address: row.street, apartment: row.locality ?? "", city: row.city, state: row.state, pinCode: row.pincode, country: row.country, isDefault: row.isDefault };
}
function toRow(userId: string, address: SavedAddress) {
  return { id: address.id, userId, fullName: address.fullName, phone: address.phone, street: address.address, locality: address.apartment || null, city: address.city, state: address.state, pincode: address.pinCode, country: address.country, isDefault: address.isDefault };
}

export async function getCustomerAccount(user: AccountUser) {
  let record = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id), columns: { id: true, deletedAt: true },
    with: { addresses: { orderBy: [desc(addresses.isDefault), asc(addresses.createdAt), asc(addresses.id)] } },
  });
  if (!record) {
    const created = await syncUser(user);
    if (!created || created.deletedAt) throw new AccountInputError("Account unavailable.");
    record = { id: created.id, deletedAt: created.deletedAt, addresses: [] };
  }
  if (record.deletedAt) throw new AccountInputError("Account unavailable.");
  const account = readAccount(user);
  const userId = record.id;
  let saved = record.addresses.map(toAddress);

  // Legacy addresses
  if (account.addresses.length) {
    const client = await clerkClient();
    saved = await db.transaction(async tx => {
      const [active] = await tx.select({ id: users.id }).from(users).where(and(eq(users.id, userId), isNull(users.deletedAt))).for("update");
      if (!active) throw new AccountInputError("Account unavailable.");
      const existing = await tx.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
      if (existing.length) return existing.map(toAddress);
      const legacy = readAccount(await client.users.getUser(user.id)).addresses;
      if (!legacy.length) return [];
      const imported = legacy.map(item => ({ ...item, id: isUuid(item.id) ? item.id : randomUUID() }));
      const defaultId = imported.find(item => item.isDefault)?.id ?? imported[0].id;
      const normalized = imported.map(item => ({ ...item, isDefault: item.id === defaultId }));
      await tx.insert(addresses).values(normalized.map(item => toRow(userId, item)));
      return normalized;
    });
    await client.users.updateUserMetadata(user.id, { privateMetadata: { account: { addresses: null } } });
  }
  return { userId, account: { ...account, addresses: saved } };
}

export async function changeCustomerAddress(userId: string, body: Record<string, unknown>) {
  return db.transaction(async tx => {
    const [user] = await tx.select({ id: users.id }).from(users).where(and(eq(users.id, userId), isNull(users.deletedAt))).for("update");
    if (!user) throw new AccountInputError("Account unavailable.");
    const rows = await tx.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), asc(addresses.createdAt), asc(addresses.id));
    const current = rows.map(toAddress);
    if (body.action === "save-address") {
      if (!body.address || typeof body.address !== "object" || Array.isArray(body.address)) throw new AccountInputError("Invalid address.");
      const input = body.address as Record<string, unknown>;
      const existingId = typeof input.id === "string" ? input.id : "";
      if (existingId && !current.some(item => item.id === existingId)) throw new AccountInputError("This address is no longer available.");
      const parsed = parseAddress(input, existingId || randomUUID());
      const next = saveAddress(current, parsed);
      const saved = next.find(item => item.id === parsed.id)!;
      if (saved.isDefault && !current.some(item => item.id === saved.id && item.isDefault)) await tx.update(addresses).set({ isDefault: false }).where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
      const values = toRow(userId, saved);
      if (existingId) await tx.update(addresses).set(values).where(and(eq(addresses.id, existingId), eq(addresses.userId, userId)));
      else await tx.insert(addresses).values(values);
      return next;
    }
    const selected = current.find(item => item.id === body.id);
    if (!selected) throw new AccountInputError("This address is no longer available.");
    if (body.action === "delete-address") {
      const next = removeAddress(current, selected.id);
      await tx.delete(addresses).where(and(eq(addresses.id, selected.id), eq(addresses.userId, userId)));
      if (selected.isDefault && next.length) await tx.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, next.find(item => item.isDefault)!.id), eq(addresses.userId, userId)));
      return next;
    }
    if (body.action === "default-address") {
      if (!selected.isDefault) {
        await tx.update(addresses).set({ isDefault: false }).where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
        await tx.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, selected.id), eq(addresses.userId, userId)));
      }
      return current.map(item => ({ ...item, isDefault: item.id === selected.id }));
    }
    throw new AccountInputError("Invalid account action.");
  });
}
