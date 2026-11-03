import AuthPage from "@/components/auth/AuthPage";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Forgot Password | Colors by Nisha Vijay",
  description: "Reset your password for Colors by Nisha Vijay.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthPage mode="forgot" />
    </Suspense>
  );
}
