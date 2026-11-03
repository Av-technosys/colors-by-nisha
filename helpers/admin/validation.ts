export type ActionState = { error?: string };

export function requiredText(form: FormData, key: string, label: string, maxLength: number) {
  const value = String(form.get(key) ?? "").trim();
  if (!value) throw new Error(`${label} is required.`);
  if (value.length > maxLength) throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  return value;
}

export function optionalText(form: FormData, key: string, maxLength?: number) {
  const value = String(form.get(key) ?? "").trim();
  if (maxLength && value.length > maxLength) throw new Error(`${key} is too long.`);
  return value || null;
}

export function validateId(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("This record has an invalid ID.");
  }
  return value;
}

export function validateSlug(value: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error("Use lowercase letters, numbers, and hyphens for the slug.");
  }
  return value;
}

export function validatePrice(value: string, label = "Price") {
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(value)) {
    throw new Error(`${label} must be a non-negative amount with up to two decimal places.`);
  }
  return value;
}

export function actionError(error: unknown) {
  const databaseError = error as { code?: string; cause?: { code?: string } };
  const code = databaseError?.cause?.code ?? databaseError?.code;
  if (code === "23505") return "That value is already in use. Check the slug and other unique fields.";
  if (code === "23503") return "This record is linked to another record. Update those references before deleting it.";
  if (code) return "The database request could not be completed. Please try again.";
  if (error instanceof Error && !error.message.startsWith("Failed query:")) return error.message;
  return "Something went wrong. Please try again.";
}
