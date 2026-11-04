import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { and, eq, isNull, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { profileValues, type ClerkProfile } from "./user-profile";

export async function syncUser(user: ClerkProfile) {
  const values = profileValues(user);
  const { createdAt, ...updates } = values;
  const [record] = await db.insert(users).values({ ...updates, createdAt }).onConflictDoUpdate({
    target: users.clerkId,
    set: { ...updates, updatedAt: new Date() },
    setWhere: and(isNull(users.deletedAt), lte(users.clerkUpdatedAt, values.clerkUpdatedAt)),
  }).returning();
  if (record) return record;
  const [existing] = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);
  return existing;
}

export async function markUserDeleted(clerkId: string) {
  const now = new Date();
  await db.insert(users).values({ clerkId, fullName: "Deleted customer", email: "", clerkUpdatedAt: now, deletedAt: now }).onConflictDoUpdate({
    target: users.clerkId,
    set: { deletedAt: now, updatedAt: now, passwordEnabled: false },
    setWhere: isNull(users.deletedAt),
  });
}

export async function syncClerkUser(clerkId: string) {
  const client = await clerkClient();
  try {
    return await syncUser(await client.users.getUser(clerkId));
  } catch (error) {
    if (typeof error === "object" && error !== null && "status" in error && error.status === 404) {
      await markUserDeleted(clerkId);
      return null;
    }
    throw error;
  }
}
