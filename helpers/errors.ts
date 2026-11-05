export class UserFacingError extends Error {}

const authMessages: Record<string, string> = {
  form_identifier_not_found: "Those sign-in details don’t match. Please check them and try again.",
  form_password_incorrect: "Those sign-in details don’t match. Please check them and try again.",
  form_code_incorrect: "That code is incorrect or has expired. Please try again or request a new code.",
  verification_expired: "That code has expired. Please request a new code.",
  verification_failed: "We couldn’t verify that code. Please try again or request a new code.",
  form_password_pwned: "Please choose a different password to help keep your account safe.",
  form_password_length_too_short: "Please choose a longer password.",
  form_param_format_invalid: "Please check the highlighted details and try again.",
  too_many_requests: "Please wait a moment before trying again.",
  session_exists: "You’re already signed in. Please refresh the page to continue.",
  form_identifier_exists: "We couldn’t create this account. Try signing in or use different details.",
};

export function friendlyError(error: unknown, fallback = "We couldn’t complete that request. Please try again.") {
  if (error instanceof UserFacingError) return error.message;
  if (error instanceof Error && error.name === "AccountInputError") return error.message;
  if (typeof error === "object" && error !== null) {
    const detail = error as { code?: string; errors?: { code?: string }[]; status?: number };
    const code = detail.errors?.[0]?.code ?? detail.code;
    if (code && authMessages[code]) return authMessages[code];
    if (detail.status === 429) return authMessages.too_many_requests;
  }
  return fallback;
}
