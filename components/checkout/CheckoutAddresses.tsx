"use client";

import { UserFacingError, friendlyError } from "@/helpers/errors";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Plus } from "lucide-react";
import { AddressDialog } from "@/components/account/AddressDialog";
import { updateAccount } from "@/components/account/account-client";
import { Modal } from "@/components/ui/Modal";
import type { CustomerAccount, SavedAddress } from "@/helpers/auth/account";

export function CheckoutAddresses({ account, selectedId, onSelect, onAccountChange }: {
  account: CustomerAccount;
  selectedId: string;
  onSelect: (address: SavedAddress | null) => void;
  onAccountChange: (account: CustomerAccount) => void;
}) {
  const [view, setView] = useState<"manage" | "new" | SavedAddress | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [removeId, setRemoveId] = useState("");
  const addresses = account.addresses.filter(item => item.country === "India");
  const canAdd = account.addresses.length < 5;

  function apply(updated: CustomerAccount, preferredId = selectedId) {
    onAccountChange(updated);
    const available = updated.addresses.filter(item => item.country === "India");
    onSelect(available.find(item => item.id === preferredId) ?? available.find(item => item.isDefault) ?? available[0] ?? null);
  }

  async function change(action: "delete-address" | "default-address", id: string) {
    if (busy) return;
    setBusy(id); setError("");
    try {
      const updated = await updateAccount({ action, id });
      if (!updated) throw new UserFacingError("Your addresses could not be updated.");
      apply(updated); setRemoveId("");
    } catch (reason) { setError(friendlyError(reason, "Please try again.")); }
    finally { setBusy(""); }
  }

  return <section className="rounded-md border border-[#e8e3da] p-5 md:p-7">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-xl"><MapPin size={18} className="text-[#94764d]" />Delivery address</h2>
      {account.addresses.length > 0 && <button type="button" onClick={() => { setError(""); setView("manage"); }} className="min-h-9 text-xs text-purple underline underline-offset-4">Manage addresses</button>}
    </div>
    {addresses.length ? <div className="space-y-3" role="radiogroup" aria-label="Delivery address">
      {addresses.map(item => <label key={item.id} className={`flex cursor-pointer gap-3 rounded-md border p-4 transition ${selectedId === item.id ? "border-purple bg-[#f7f5fa]" : "border-[#e8e3da] hover:border-[#c4a36a]"}`}>
        <input type="radio" name="saved-address" value={item.id} checked={selectedId === item.id} onChange={() => onSelect(item)} className="mt-1 size-4 shrink-0 accent-purple" />
        <span className="min-w-0 text-sm">
          <span className="flex flex-wrap items-center gap-2 font-medium">{item.fullName}{item.isDefault && <span className="rounded-sm bg-purple/5 px-2 py-1 text-[10px] font-normal text-purple">Default</span>}</span>
          <span className="mt-2 block break-words leading-relaxed text-neutral-500">{item.address}{item.apartment && `, ${item.apartment}`}<br />{item.city}, {item.state} – {item.pinCode}</span>
          <span className="mt-2 block text-xs text-neutral-500">{item.phone}</span>
        </span>
      </label>)}
    </div> : <p className="mb-4 text-sm leading-relaxed text-neutral-500">{account.addresses.length ? "Add an Indian delivery address to continue." : "Add a delivery address to continue. It will be saved for your next order."}</p>}
    <button type="button" disabled={!canAdd} onClick={() => setView("new")} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-[#c4a36a] px-4 text-xs text-purple transition hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={15} />Add new address</button>
    {!canAdd && <p className="mt-2 text-xs text-neutral-500">Your address book is full. Remove an address to add another.</p>}
    {view && createPortal(view === "manage" ? <Modal title="Manage addresses" onClose={() => { if (!busy) setView(null); }} className="w-full max-w-xl p-6 md:p-8">
      <h2 className="pr-8 font-display text-2xl">Your address book</h2>
      {error && <p role="alert" className="mt-4 text-sm text-[#9e5144]">{error}</p>}
      <div className="mt-4 divide-y divide-[#e8e3da]">{account.addresses.map(item => <article key={item.id} className="py-5">
        <p className="text-sm font-medium">{item.fullName}{item.isDefault && <span className="ml-2 text-xs font-normal text-[#94764d]">Default</span>}</p>
        <p className="mt-2 break-words text-sm leading-relaxed text-neutral-500">{item.address}{item.apartment && `, ${item.apartment}`}, {item.city}, {item.state} {item.pinCode}, {item.country}</p>
        <p className="mt-2 text-xs text-neutral-500">{item.phone}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <button type="button" disabled={Boolean(busy)} onClick={() => setView(item)} className="min-h-9 text-purple disabled:opacity-50">Edit</button>
          {!item.isDefault && <button type="button" disabled={Boolean(busy)} onClick={() => change("default-address", item.id)} className="min-h-9 text-purple disabled:opacity-50">Set as default</button>}
          <button type="button" disabled={Boolean(busy)} onClick={() => setRemoveId(item.id)} className="min-h-9 text-[#9e5144] disabled:opacity-50">Remove</button>
        </div>
        {removeId === item.id && <div className="mt-2 rounded-md bg-[#faf9f6] p-3 text-xs"><p>Remove this saved address?</p><div className="mt-2 flex gap-5"><button type="button" disabled={Boolean(busy)} onClick={() => change("delete-address", item.id)} className="min-h-9 text-[#9e5144]">{busy === item.id ? "Removing…" : "Remove address"}</button><button type="button" disabled={Boolean(busy)} onClick={() => setRemoveId("")} className="min-h-9 text-purple">Cancel</button></div></div>}
      </article>)}</div>
      {canAdd && <button type="button" disabled={Boolean(busy)} onClick={() => setView("new")} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-purple"><Plus size={15} />Add new address</button>}
    </Modal> : <AddressDialog key={typeof view === "string" ? view : view.id} account={account} address={typeof view === "string" ? undefined : view} indiaOnly={view === "new"} onClose={() => setView(null)} onSaved={updated => {
      const savedId = view === "new" ? updated.addresses.find(item => !account.addresses.some(previous => previous.id === item.id))?.id : typeof view === "object" ? view.id : selectedId;
      apply(updated, savedId); setView(null);
    }} />, document.body)}
  </section>;
}
