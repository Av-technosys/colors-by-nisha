"use client";

import { HandleSSOCallback, useClerk, useSignIn } from "@clerk/nextjs";
import { consumeReturnPath } from "@/helpers/auth/return-path";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoogleCallback() {
  const router = useRouter();
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const [error, setError] = useState("");

  async function continueSignIn() {
    try {
      if (signIn.status === "needs_new_password") { router.replace("/forgot-password?step=password"); return; }
      const factors = signIn.supportedSecondFactors;
      let flow = "";
      if (factors.some(factor => factor.strategy === "email_code")) {
        const result = await signIn.mfa.sendEmailCode();
        if (result.error) throw result.error;
        flow = "signin";
      } else if (factors.some(factor => factor.strategy === "phone_code")) {
        const result = await signIn.mfa.sendPhoneCode();
        if (result.error) throw result.error;
        flow = "phone";
      } else if (factors.some(factor => factor.strategy === "totp")) flow = "totp";
      if (flow) router.replace(`/verify-otp?flow=${flow}`);
      else setError("Google sign-in could not be completed. Please return to sign in and try again.");
    } catch {
      setError("The verification code could not be sent. Please return to sign in and try again.");
    }
  }

  return <main className="grid min-h-svh place-items-center bg-white px-4 text-ink">
    <div className="w-full max-w-md space-y-4 text-center">
      <HandleSSOCallback
        navigateToApp={async ({ session, decorateUrl }) => {
          if (session?.currentTask) { await clerk.redirectToTasks({ redirectUrl: "/dashboard" }); return; }
          const destination = decorateUrl(consumeReturnPath());
          if (destination.startsWith("http")) window.location.assign(destination);
          else router.replace(destination);
        }}
        navigateToSignIn={continueSignIn}
        navigateToSignUp={() => router.replace("/signup?sso=complete")}
      />
      <p role="status" className="text-sm text-neutral-600">{error || "Completing Google sign-in…"}</p>
      {error && <Link href="/login" className="inline-flex rounded-md bg-purple px-5 py-3 text-sm text-white">Back to sign in</Link>}
    </div>
  </main>;
}
