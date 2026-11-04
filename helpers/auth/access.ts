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
