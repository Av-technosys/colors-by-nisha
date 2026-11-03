import AuthPage from "@/components/auth/AuthPage";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email OTP | Colors by Nisha Vijay",
  description: "Verify your 6-digit email OTP for Colors by Nisha Vijay.",
};

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthPage mode="verify-otp" />
    </Suspense>
  );
}

