import { UserFacingError } from "@/helpers/errors";
export type ActionState = { error?: string };

export function requiredText(form: FormData, key: string, label: string, maxLength: number) {
  const value = String(form.get(key) ?? "").trim();
  if (!value) throw new UserFacingError(`${label} is required.`);
  if (value.length > maxLength) throw new UserFacingError(`${label} must be ${maxLength} characters or fewer.`);
  return value;
}

export function optionalText(form: FormData, key: string, maxLength?: number) {
  const value = String(form.get(key) ?? "").trim();
  if (maxLength && value.length > maxLength) throw new UserFacingError(`${key} is too long.`);
  return value || null;
}

export function validateId(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new UserFacingError("This record has an invalid ID.");
  }
  return value;
}

export function validateSlug(value: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new UserFacingError("Use lowercase letters, numbers, and hyphens for the slug.");
  }
  return value;
}

export function validatePrice(value: string, label = "Price") {
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(value)) {
    throw new UserFacingError(`${label} must be a non-negative amount with up to two decimal places.`);
  }
  return value;
}

export function actionError(error: unknown) {
  console.error("Admin action error:", error);
  const databaseError = error as { code?: string; cause?: { code?: string; detail?: string; message?: string } };
  const code = databaseError?.cause?.code ?? databaseError?.code;
  if (code === "23505") return "That value is already in use. Please choose a different one.";
  if (code === "23503") return "This item is linked to another record. Please review those links and try again.";
  if (["22001", "23502", "22P02"].includes(code ?? "")) return "Please check the form details and try again.";
  if (error instanceof UserFacingError) return error.message;
  return "We couldn’t save your changes right now. Please try again.";
}
