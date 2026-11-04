"use client";

import { useUser } from "@clerk/nextjs";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { parseContact, type CustomerAccount } from "@/helpers/auth/account";
import { updateAccount } from "./account-client";

const inputClass = "min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-purple focus:ring-2 focus:ring-purple/10";

export function ProfileDialog({ account, incomplete, onClose, onSaved }: { account: CustomerAccount; incomplete: boolean; onClose: () => void; onSaved: (account: CustomerAccount) => void }) {
  const { user } = useUser();
  const [fullName, setFullName] = useState(account.fullName);
  const [email, setEmail] = useState(account.email);
  const [mobile, setMobile] = useState(account.mobile);
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!user || saving) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const contact = parseContact({ fullName, mobile });
      const address = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error("Please enter a valid email address.");
      if (address !== account.email.toLowerCase()) {
        const refreshed = await user.reload();
        let nextEmail = refreshed.emailAddresses.find(item => item.emailAddress.toLowerCase() === address);
        if (!nextEmail) nextEmail = await user.createEmailAddress({ email: address });
        if (nextEmail.verification.status !== "verified") {
          if (pendingEmail !== address) {
            await nextEmail.prepareVerification({ strategy: "email_code" });
            setPendingEmail(address);
            setCode("");
            setNotice("We sent a verification code to your new email address.");
            return;
          }
          const verified = await nextEmail.attemptVerification({ code });
          if (verified.verification.status !== "verified") throw new Error("Please verify your new email address.");
        }
        await user.update({ primaryEmailAddressId: nextEmail.id });
      }
      const updated = await updateAccount({ action: "profile", ...contact });
      if (!updated) throw new Error("Your profile could not be saved. Please retry.");
      await user.reload();
      onSaved(updated);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Your profile could not be saved. Please try again.");
    } finally { setSaving(false); }
  }

  async function resend() {
    if (!user || saving) return;
    setSaving(true);
    setError("");
    try {
      const refreshed = await user.reload();
      const address = refreshed.emailAddresses.find(item => item.emailAddress.toLowerCase() === pendingEmail);
      if (!address) throw new Error("Please save your email address again.");
      await address.prepareVerification({ strategy: "email_code" });
      setNotice("A fresh verification code has been sent.");
    } catch (error) { setError(error instanceof Error ? error.message : "The code could not be sent."); }
    finally { setSaving(false); }
  }

  return <Modal title={incomplete ? "Complete your profile" : "Edit personal details"} onClose={onClose} className="w-full max-w-lg p-6 md:p-8">
    <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-neutral-400">Your account</p>
    <h2 className="pr-6 font-display text-2xl font-medium leading-tight text-ink">{incomplete ? "A few details to make it yours" : "Personal details"}</h2>
    <p className="mt-3 text-sm leading-relaxed text-neutral-500">{incomplete ? "Please add your missing name, email or mobile number to complete your profile." : "Keep your contact details up to date. Changes to your email require verification."}</p>
    <form onSubmit={save} className="mt-6 space-y-4">
      <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
        <label className="block space-y-2 text-xs font-medium text-neutral-600"><span>Full name</span><input required maxLength={255} autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} className={inputClass} /></label>
        <label className="block space-y-2 text-xs font-medium text-neutral-600"><span>Email address</span><input required type="email" maxLength={320} autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setCode(""); }} className={inputClass} /></label>
        <label className="block space-y-2 text-xs font-medium text-neutral-600"><span>Mobile number</span><input required type="tel" maxLength={30} autoComplete="tel" placeholder="+91 98765 43210" value={mobile} onChange={event => setMobile(event.target.value)} className={inputClass} /><span className="block text-[11px] font-normal text-neutral-400">Include the country code for numbers outside India.</span></label>
        {pendingEmail === email.trim().toLowerCase() && pendingEmail && <label className="block space-y-2 text-xs font-medium text-neutral-600"><span>Email verification code</span><input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} className={inputClass} /><button type="button" onClick={resend} className="text-xs text-purple underline underline-offset-4">Resend code</button></label>}
      </fieldset>
      {notice && <p role="status" className="text-sm text-neutral-600">{notice}</p>}
      {error && <p role="alert" className="rounded-md bg-[#f8efec] p-3 text-sm text-[#a54d42]">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5"><button type="button" disabled={saving} onClick={onClose} className="rounded-md px-4 py-2.5 text-sm text-neutral-500">{incomplete ? "Later" : "Cancel"}</button><button disabled={saving || !user} className="min-h-11 rounded-md bg-purple px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#40345f] disabled:opacity-50">{saving ? "Saving…" : pendingEmail ? "Verify & save" : incomplete ? "Complete profile" : "Save changes"}</button></div>
    </form>
  </Modal>;
}
