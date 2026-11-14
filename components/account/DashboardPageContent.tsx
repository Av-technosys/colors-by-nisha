"use client";

import { UserFacingError, friendlyError } from "@/helpers/errors";

import { useRouter } from "next/navigation";
import { useClerk, useSession } from "@clerk/nextjs";
import { useCallback, useState, type ReactNode } from "react";
import { Check, LogOut, Mail, MapPin, Pencil, Phone, Plus, Trash2, UserRound } from "lucide-react";
import type { CustomerAccount, SavedAddress } from "@/helpers/auth/account";
import { ProfileDialog } from "./ProfileDialog";
import { AddressDialog } from "./AddressDialog";
import { updateAccount } from "./account-client";

export default function DashboardPageContent({ initialAccount, children }: { initialAccount: CustomerAccount; children?: ReactNode }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { session } = useSession();
  const [account, setAccount] = useState(initialAccount);
  const [showProfile, setShowProfile] = useState(!initialAccount.fullName || !initialAccount.email || !initialAccount.mobile);
  const [addressDialog, setAddressDialog] = useState<SavedAddress | "new" | null>(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const closeProfile = useCallback(() => setShowProfile(false), []);
  const closeAddress = useCallback(() => setAddressDialog(null), []);
  const missingDetails = !account.fullName || !account.email || !account.mobile;

  async function changeAddress(action: "delete-address" | "default-address", address: SavedAddress) {
    if (busy) return;
    setBusy(`${action}:${address.id}`);
    setNotice(null);
    try {
      const updated = await updateAccount({ action, id: address.id });
      if (!updated) throw new UserFacingError("Your addresses could not be updated.");
      setAccount(updated);
      setNotice({ text: action === "delete-address" ? "Address removed." : "Default address updated." });
    } catch (error) { setNotice({ text: friendlyError(error, "Please try again."), error: true }); }
    finally { setBusy(""); }
  }

  async function logout(allDevices = false) {
    if (busy) return;
    setBusy(allDevices ? "sign-out-all" : "sign-out");
    setNotice(null);
    try {
      if (allDevices) await updateAccount({ action: "sign-out-all" });
      await signOut({ sessionId: session?.id, redirectUrl: "/login" });
    } catch {
      setNotice({ text: "You could not be signed out. Please try again.", error: true });
      setBusy("");
    }
  }

  return <>
      {notice && <div role={notice.error ? "alert" : "status"} className={`mb-6 rounded-md border px-4 py-3 text-sm ${notice.error ? "border-[#eddbd5] bg-[#faf0ed] text-[#9e5144]" : "border-[#dce4da] bg-[#f0f4ed] text-[#50654d]"}`}>{notice.text}</div>}

        <div className="min-w-0 space-y-6">
          {children}
          {missingDetails && <div className="flex flex-col gap-4 rounded-md border border-[#e6dccb] bg-[#f4efe6] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-lg font-medium text-purple">Let’s complete your profile</h2><p className="mt-1 text-sm leading-relaxed text-neutral-600">Add your missing name, email or mobile number.</p></div><button type="button" onClick={() => setShowProfile(true)} className="min-h-10 shrink-0 rounded-md bg-purple px-4 text-sm text-white transition hover:bg-[#40345f]">Add details</button></div>}

          <section className="overflow-hidden rounded-md border border-[#e8e3da] bg-white" aria-labelledby="personal-details-title">
            <div className="flex items-center justify-between gap-4 border-b border-[#eeeae4] px-5 py-5 md:px-7"><div><h2 id="personal-details-title" className="font-display text-xl font-medium">Personal details</h2><p className="mt-1 text-xs text-neutral-600">How we can get in touch with you.</p></div><button type="button" onClick={() => setShowProfile(true)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#e5e1da] px-3.5 text-xs font-medium text-purple transition hover:border-purple"><Pencil size={13} aria-hidden="true" />Edit</button></div>
            <dl className="divide-y divide-[#f0ede8] px-5 md:px-7">
              {[
                { label: "Full name", value: account.fullName, icon: UserRound, verified: false },
                { label: "Email address", value: account.email, icon: Mail, verified: account.emailVerified },
                { label: "Mobile number", value: account.mobile, icon: Phone, verified: account.mobileVerified },
              ].map(({ label, value, icon: Icon, verified }) => <div key={label} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-5"><dt className="flex shrink-0 items-center gap-3 text-xs text-neutral-600 sm:pt-0.5"><Icon size={16} aria-hidden="true" />{label}</dt><dd className="flex min-w-0 flex-wrap items-center gap-2.5 pl-7 text-sm text-neutral-800 sm:justify-end sm:pl-0 md:text-[15px]"><span className="break-all">{value || "Not added"}</span>{verified && <span className="inline-flex items-center gap-1 rounded-md bg-[#f0f3ed] px-2 py-1 text-[10px] text-[#627455]"><Check size={11} aria-hidden="true" />Verified</span>}</dd></div>)}
            </dl>
          </section>

          <section className="overflow-hidden rounded-md border border-[#e8e3da] bg-white" aria-labelledby="addresses-title">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeae4] px-5 py-5 md:px-7"><div><h2 id="addresses-title" className="font-display text-xl font-medium">Saved addresses <span className="ml-1 text-sm font-normal text-neutral-600">({account.addresses.length})</span></h2><p className="mt-1 text-xs text-neutral-600">Keep your favourite destinations ready.</p></div><button type="button" disabled={Boolean(busy) || account.addresses.length >= 5} onClick={() => setAddressDialog("new")} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#e5e1da] px-3.5 text-xs font-medium text-purple transition hover:border-purple disabled:opacity-40"><Plus size={15} aria-hidden="true" />Add address</button></div>
            {!account.addresses.length ? <div className="flex flex-col items-center px-5 py-10 text-center md:py-12"><span className="mb-4 grid size-12 place-items-center rounded-md bg-[#f5f2ed] text-[#9f907b]"><MapPin size={23} aria-hidden="true" /></span><h3 className="font-display text-lg">A place for something special</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-600">Save an address so it’s ready for your next order.</p><button type="button" onClick={() => setAddressDialog("new")} className="mt-5 min-h-10 rounded-md bg-purple px-4 text-xs font-medium text-white transition hover:bg-[#40345f]">Add your first address</button></div> : <div className="divide-y divide-[#f0ede8] px-5 md:px-7">{account.addresses.map(address => <article key={address.id} className="py-6"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-medium">{address.fullName}</h3>{address.isDefault && <span className="rounded-md bg-[#f2eff6] px-2 py-1 text-[10px] text-purple">Default</span>}</div><MapPin size={16} className="mt-1 shrink-0 text-neutral-300" aria-hidden="true" /></div><p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-neutral-500">{address.address}{address.apartment ? `, ${address.apartment}` : ""}<br />{address.city}, {address.state} {address.pinCode}<br />{address.country}</p><p className="mt-3 flex items-center gap-2 text-xs text-neutral-600"><Phone size={12} aria-hidden="true" />{address.phone}</p><div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"><button type="button" disabled={Boolean(busy)} onClick={() => setAddressDialog(address)} className="inline-flex min-h-9 items-center gap-1.5 text-purple hover:underline disabled:opacity-40"><Pencil size={12} aria-hidden="true" />Edit</button>{!address.isDefault && <button type="button" disabled={Boolean(busy)} onClick={() => void changeAddress("default-address", address)} className="min-h-9 text-neutral-500 hover:text-purple disabled:opacity-40">{busy === `default-address:${address.id}` ? "Updating…" : "Set as default"}</button>}<button type="button" disabled={Boolean(busy)} onClick={() => void changeAddress("delete-address", address)} className="inline-flex min-h-9 items-center gap-1.5 text-[#a16b60] hover:underline disabled:opacity-40"><Trash2 size={12} aria-hidden="true" />{busy === `delete-address:${address.id}` ? "Removing…" : "Remove"}</button></div></article>)}</div>}
          </section>

          <section className="flex flex-col justify-between gap-5 rounded-md border border-[#e8e3da] bg-white px-5 py-6 xl:flex-row xl:items-center md:px-7" aria-labelledby="account-access-title"><div><h2 id="account-access-title" className="font-display text-lg font-medium">Account access</h2><p className="mt-1 text-xs leading-relaxed text-neutral-600">Manage where you’re signed in.</p></div><div className="flex flex-wrap items-center gap-4"><button type="button" disabled={Boolean(busy) || !session} onClick={() => void logout()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#e5e1da] px-4 text-xs font-medium text-purple transition hover:border-purple disabled:opacity-40"><LogOut size={14} aria-hidden="true" />{busy === "sign-out" ? "Signing out…" : "Sign out"}</button><button type="button" disabled={Boolean(busy) || !session} onClick={() => void logout(true)} className="min-h-10 text-xs text-neutral-600 underline-offset-4 hover:underline disabled:opacity-40">{busy === "sign-out-all" ? "Signing out devices…" : "Sign out of all devices"}</button></div></section>
        </div>

    {showProfile && <ProfileDialog account={account} incomplete={missingDetails} onClose={closeProfile} onSaved={updated => { setAccount(updated); router.refresh(); setShowProfile(false); setNotice({ text: "Your personal details have been saved." }); }} />}
    {addressDialog && <AddressDialog account={account} address={addressDialog === "new" ? undefined : addressDialog} onClose={closeAddress} onSaved={updated => { setAccount(updated); setAddressDialog(null); setNotice({ text: "Your address has been saved." }); }} />}

  </>;
}
