import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import { profileValues } from "../helpers/auth/user-profile.ts";

const source = readFileSync(new URL("../helpers/auth/account.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
runInNewContext(compiled, { exports, require: () => ({ profileValues }) });
const { normalizeMobile, parseContact, parseAddress, saveAddress, removeAddress, readAccount } = exports;
const input = { fullName: "Test Customer", country: "India", address: "12 Example Road", apartment: "", city: "Jaipur", state: "Rajasthan", pinCode: "302001", phone: "98765 43210", isDefault: false };

const user = {
  id: "user_test", firstName: null, lastName: null,
  primaryEmailAddressId: "email_1", primaryPhoneNumberId: null,
  emailAddresses: [{ id: "email_1", emailAddress: "customer@example.com", verification: { status: "verified" } }], phoneNumbers: [],
  unsafeMetadata: {}, privateMetadata: {}, passwordEnabled: false, createdAt: 1700000000000, updatedAt: 1700000001000,
};

test("contact validation normalizes Indian and international mobile numbers", () => {
  assert.equal(normalizeMobile("98765 43210"), "+919876543210");
  assert.equal(normalizeMobile("+1 (202) 555-0123"), "+12025550123");
  assert.throws(() => parseContact({ fullName: "", mobile: "9876543210" }), /full name/);
  assert.throws(() => parseContact({ fullName: "Customer", mobile: "abc" }), /valid mobile/);
});

test("missing Google profile fields remain missing instead of becoming placeholder data", () => {
  const account = readAccount(user);
  assert.equal(account.fullName, "");
  assert.equal(account.mobile, "");
  assert.equal(account.email, "customer@example.com");
  assert.equal(account.emailVerified, true);
});

test("saved account metadata is read without exposing unrelated private data", () => {
  const address = parseAddress(input, "address_1");
  const account = readAccount({ ...user, unsafeMetadata: { fullName: "Test Customer", mobile: "+919876543210" }, privateMetadata: { internalSecret: "not-for-client", account: { addresses: [address] } } });
  assert.equal(account.fullName, "Test Customer");
  assert.equal(account.addresses.length, 1);
  assert.equal("internalSecret" in account, false);
});

test("the first address is default and choosing another leaves exactly one default", () => {
  const first = saveAddress([], parseAddress(input, "first"));
  assert.equal(first[0].isDefault, true);
  const next = saveAddress(first, parseAddress({ ...input, isDefault: true }, "second"));
  assert.equal(next.filter(item => item.isDefault).length, 1);
  assert.equal(next.find(item => item.isDefault).id, "second");
});

test("removing the default address promotes a remaining address", () => {
  const first = saveAddress([], parseAddress(input, "first"));
  const both = saveAddress(first, parseAddress(input, "second"));
  const remaining = removeAddress(both, "first");
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, "second");
  assert.equal(remaining[0].isDefault, true);
});

test("address edits preserve identity, enforce bounds, and reject invalid PIN codes", () => {
  assert.throws(() => parseAddress({ ...input, pinCode: "12" }, "first"), /PIN code/);
  const five = Array.from({ length: 5 }, (_, index) => parseAddress(input, String(index)));
  assert.throws(() => saveAddress(five, parseAddress(input, "sixth")), /up to 5/);
  const edited = saveAddress(five, parseAddress({ ...input, city: "Jodhpur" }, "0"));
  assert.equal(edited.length, 5);
  assert.equal(edited[0].city, "Jodhpur");
});
