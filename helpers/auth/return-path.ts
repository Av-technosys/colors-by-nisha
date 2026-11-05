export function safeReturnPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\") || /^\/(?:%2f|%5c)/i.test(value)) return "/dashboard";
  const url = new URL(value, "https://return.invalid");
  if (url.origin !== "https://return.invalid" || /^\/(login|signup|verify-otp|forgot-password|sso-callback)(\/|$)/.test(url.pathname)) return "/dashboard";
  return `${url.pathname}${url.search}${url.hash}`;
}

export function rememberReturnPath(value: string | null) {
  if (!value) return;
  try { sessionStorage.setItem("cbn_auth_return", safeReturnPath(value)); } catch { /* Storage unavailable */ }
}

export function consumeReturnPath(value?: string | null) {
  let path = value;
  try { path ||= sessionStorage.getItem("cbn_auth_return"); sessionStorage.removeItem("cbn_auth_return"); } catch { /* Storage unavailable */ }
  return safeReturnPath(path);
}
