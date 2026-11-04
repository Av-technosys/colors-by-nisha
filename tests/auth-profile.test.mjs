import assert from "node:assert/strict";
import test from "node:test";
import { hasAdminEmail, profileValues } from "../helpers/auth/user-profile.ts";

const source = {
  id: "user_test", firstName: "Test", lastName: "Customer",
  primaryEmailAddressId: "email_primary", primaryPhoneNumberId: null,
  emailAddresses: [{ id: "email_primary", emailAddress: "CUSTOMER@example.com", verification: { status: "verified" } }],
  phoneNumbers: [], unsafeMetadata: { fullName: "Customer Name", mobile: "+919876543210" },
  passwordEnabled: true, createdAt: 1700000000000, updatedAt: 1700000001000,
};

test("a collected contact number is never marked verified", () => {
  const profile = profileValues(source);
  assert.equal(profile.mobile, "+919876543210");
  assert.equal(profile.mobileVerified, false);
  assert.equal(profile.email, "customer@example.com");
  assert.equal(profile.fullName, "Customer Name");
  assert.equal(profile.passwordEnabled, true);
  assert.equal("password" in profile, false);
  assert.equal("passwordHash" in profile, false);
});

test("changing the contact number does not inherit another number's verification", () => {
  const profile = profileValues({ ...source, primaryPhoneNumberId: "phone_primary", phoneNumbers: [{ id: "phone_primary", phoneNumber: "+919111111111", verification: { status: "verified" } }] });
  assert.equal(profile.mobile, "+919876543210");
  assert.equal(profile.mobileVerified, false);
});

test("invalid metadata cannot create a verified contact or admin permission", () => {
  const user = { ...source, unsafeMetadata: { mobile: "invalid", role: "admin", email: "admin@example.com" } };
  assert.equal(profileValues(user).mobile, null);
  assert.equal(hasAdminEmail(user, "admin@example.com"), false);
});

test("admin allowlist requires a verified email and defaults to deny", () => {
  assert.equal(hasAdminEmail(source, ""), false);
  assert.equal(hasAdminEmail(source, " CUSTOMER@example.com "), true);
  assert.equal(hasAdminEmail({ emailAddresses: [{ ...source.emailAddresses[0], verification: { status: "unverified" } }] }, "customer@example.com"), false);
  assert.equal(hasAdminEmail(source, "other@example.com"), false);
});

test("user sync keeps Clerk timestamps and does not trust verification metadata", () => {
  const profile = profileValues({ ...source, emailAddresses: [], unsafeMetadata: { ...source.unsafeMetadata, emailVerified: true, passwordEnabled: true }, passwordEnabled: false });
  assert.equal(profile.emailVerified, false);
  assert.equal(profile.passwordEnabled, false);
  assert.equal(profile.clerkUpdatedAt.getTime(), source.updatedAt);
  assert.equal(profile.createdAt.getTime(), source.createdAt);
});

test("a verified phone keeps verification only when the contact number matches", () => {
  const profile = profileValues({ ...source, primaryPhoneNumberId: "phone_primary", phoneNumbers: [{ id: "phone_primary", phoneNumber: "+919876543210", verification: { status: "verified" } }] });
  assert.equal(profile.mobileVerified, true);
});
