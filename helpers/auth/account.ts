import { profileValues, type ClerkProfile } from "./user-profile";

export interface SavedAddress {
  id: string;
  fullName: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  isDefault: boolean;
}

export interface CustomerAccount {
  fullName: string;
  email: string;
  mobile: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  joinedAt: string;
  addresses: SavedAddress[];
}

export class AccountInputError extends Error { name = "AccountInputError"; }

export function normalizeMobile(value: string) {
  const compact = value.trim().replace(/[\s()-]/g, "");
  if (/^[6-9]\d{9}$/.test(compact)) return `+91${compact}`;
  if (/^91[6-9]\d{9}$/.test(compact)) return `+${compact}`;
  if (!/^\+[1-9]\d{7,14}$/.test(compact)) throw new AccountInputError("Enter a valid mobile number, including the country code outside India.");
  return compact;
}

function text(value: unknown, label: string, max: number, required = true) {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new AccountInputError(`Please enter ${label}.`);
  if (result.length > max) throw new AccountInputError(`${label} is too long.`);
  return result;
}

export function parseContact(input: Record<string, unknown>) {
  return { fullName: text(input.fullName, "your full name", 255), mobile: normalizeMobile(text(input.mobile, "your mobile number", 30)) };
}

export function parseAddress(input: Record<string, unknown>, id: string): SavedAddress {
  const country = text(input.country, "a country", 80);
  const pinCode = text(input.pinCode, "a postal code", 16);
  if (country === "India" && !/^\d{6}$/.test(pinCode)) throw new AccountInputError("Enter a valid 6-digit PIN code.");
  return {
    id, country, pinCode,
    fullName: text(input.fullName, "the recipient name", 120),
    address: text(input.address, "the street address", 180),
    apartment: text(input.apartment, "apartment details", 80, false),
    city: text(input.city, "a city", 80),
    state: text(input.state, "a state or region", 80),
    phone: normalizeMobile(text(input.phone, "a contact number", 30)),
    isDefault: input.isDefault === true,
  };
}

export function saveAddress(addresses: SavedAddress[], address: SavedAddress) {
  const exists = addresses.some(item => item.id === address.id);
  if (!exists && addresses.length >= 5) throw new AccountInputError("You can save up to 5 addresses. Remove one before adding another.");
  const next = exists ? addresses.map(item => item.id === address.id ? address : item) : [...addresses, address];
  const defaultId = address.isDefault ? address.id : next.find(item => item.isDefault)?.id || next[0]?.id;
  return next.map(item => ({ ...item, isDefault: item.id === defaultId }));
}

export function removeAddress(addresses: SavedAddress[], id: string) {
  const next = addresses.filter(item => item.id !== id);
  const defaultId = next.find(item => item.isDefault)?.id || next[0]?.id;
  return next.map(item => ({ ...item, isDefault: item.id === defaultId }));
}

export function readAccount(user: ClerkProfile & { privateMetadata: Record<string, unknown> }): CustomerAccount {
  const values = profileValues(user);
  const data = user.privateMetadata.account;
  const saved = typeof data === "object" && data !== null && "addresses" in data && Array.isArray(data.addresses) ? data.addresses : [];
  const addresses: SavedAddress[] = [];
  for (const item of saved.slice(0, 5)) {
    if (typeof item !== "object" || item === null || typeof item.id !== "string") continue;
    try { addresses.push(parseAddress(item, item.id)); } catch { /* Invalid address */ }
  }
  const fullName = typeof user.unsafeMetadata.fullName === "string" ? user.unsafeMetadata.fullName.trim() : "";
  return {
    fullName: (fullName || [user.firstName, user.lastName].filter(Boolean).join(" ").trim()).slice(0, 255),
    email: values.email, mobile: values.mobile || "", emailVerified: values.emailVerified,
    mobileVerified: values.mobileVerified, joinedAt: new Date(user.createdAt).toISOString(), addresses,
  };
}
