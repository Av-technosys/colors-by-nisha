import { UserFacingError } from "@/helpers/errors";
import type { CustomerAccount } from "@/helpers/auth/account";

export async function updateAccount(body: Record<string, unknown>): Promise<CustomerAccount | undefined> {
  const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => { throw new UserFacingError("Unable to connect. Please check your connection and try again."); });
  const result = await response.json().catch(() => { throw new UserFacingError("Your changes could not be saved. Please try again."); });
  if (!response.ok) throw new UserFacingError(result.error || "Your changes could not be saved. Please try again.");
  return result.account;
}
