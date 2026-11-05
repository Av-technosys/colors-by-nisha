import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasAdminEmail } from "./user-profile";

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!hasAdminEmail(user, process.env.ADMIN_EMAILS ?? "")) redirect("/dashboard");
  return user;
}

export async function adminAccessError() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Please sign in to continue." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!hasAdminEmail(user, process.env.ADMIN_EMAILS ?? "")) return Response.json({ error: "You don’t have access to this page." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  return null;
}
