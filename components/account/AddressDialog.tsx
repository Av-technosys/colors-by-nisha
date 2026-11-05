"use client";

import { UserFacingError, friendlyError } from "@/helpers/errors";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import type { CustomerAccount, SavedAddress } from "@/helpers/auth/account";
import { updateAccount } from "./account-client";
import { indianStates, worldCountries } from "./address-options";

const inputClass = "min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-purple focus:ring-2 focus:ring-purple/10";

export function AddressDialog({ account, address, onClose, onSaved, indiaOnly = false }: { account: CustomerAccount; address?: SavedAddress; onClose: () => void; onSaved: (account: CustomerAccount) => void; indiaOnly?: boolean }) {
  const [form, setForm] = useState({ id: address?.id || "", fullName: address?.fullName || account.fullName, country: address?.country || "India", address: address?.address || "", apartment: address?.apartment || "", city: address?.city || "", state: address?.state || "", pinCode: address?.pinCode || "", phone: address?.phone || account.mobile, isDefault: address?.isDefault ?? !account.addresses.length });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateAccount({ action: "save-address", address: form });
      if (!updated) throw new UserFacingError("The address could not be saved. Please retry.");
      onSaved(updated);
    } catch (error) { setError(friendlyError(error, "The address could not be saved.")); }
    finally { setSaving(false); }
  }

  const fields = [
    { key: "fullName", label: "Recipient name", autoComplete: "name", maxLength: 120 },
    { key: "address", label: "Street address", autoComplete: "address-line1", maxLength: 180 },
    { key: "apartment", label: "Apartment, suite, etc. (optional)", autoComplete: "address-line2", maxLength: 80 },
    { key: "city", label: "City", autoComplete: "address-level2", maxLength: 80 },
    { key: "state", label: "State / region", autoComplete: "address-level1", maxLength: 80 },
    { key: "pinCode", label: form.country === "India" ? "PIN code" : "Postal code", autoComplete: "postal-code", maxLength: 16 },
    { key: "phone", label: "Contact number", autoComplete: "tel", maxLength: 30 },
  ] as const;

  return <Modal title={address ? "Edit address" : "Add address"} onClose={onClose} className="w-full max-w-xl p-6 md:p-8">
    <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-neutral-400">Address book</p>
    <h2 className="pr-6 font-display text-2xl font-medium text-ink">{address ? "Edit saved address" : "A place for your next heirloom"}</h2>
    <form onSubmit={save} className="mt-6 space-y-4">
      <fieldset disabled={saving} className="grid grid-cols-1 gap-4 sm:grid-cols-2 disabled:opacity-70">
        <label className="space-y-2 text-xs font-medium text-neutral-600 sm:col-span-2"><span>Country / region</span><select disabled={indiaOnly} autoComplete="country-name" value={form.country} onChange={event => setForm(current => ({ ...current, country: event.target.value }))} className={inputClass}>{worldCountries.map(country => <option key={country.name}>{country.name}</option>)}</select></label>
        {fields.map(field => <label key={field.key} className={`space-y-2 text-xs font-medium text-neutral-600 ${["fullName", "address", "apartment", "phone"].includes(field.key) ? "sm:col-span-2" : ""}`}>
          <span>{field.label}</span><input required={field.key !== "apartment"} maxLength={field.maxLength} type={field.key === "phone" ? "tel" : "text"} autoComplete={field.autoComplete} list={field.key === "state" && form.country === "India" ? "account-states" : undefined} value={form[field.key]} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))} className={inputClass} />
        </label>)}
        <datalist id="account-states">{indianStates.map(state => <option key={state} value={state} />)}</datalist>
        <label className="flex items-center gap-2.5 text-sm text-neutral-600 sm:col-span-2"><input type="checkbox" checked={form.isDefault} onChange={event => setForm(current => ({ ...current, isDefault: event.target.checked }))} className="size-4 rounded-md accent-purple" />Use as my default address</label>
      </fieldset>
      {error && <p role="alert" className="rounded-md bg-[#f8efec] p-3 text-sm text-[#a54d42]">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5"><button type="button" disabled={saving} onClick={onClose} className="rounded-md px-4 py-2.5 text-sm text-neutral-500">Cancel</button><button disabled={saving} className="min-h-11 rounded-md bg-purple px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#40345f] disabled:opacity-50">{saving ? "Saving…" : "Save address"}</button></div>
    </form>
  </Modal>;
}
