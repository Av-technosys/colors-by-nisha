import AuthPage from "@/components/auth/AuthPage";
import type { Metadata } from "next";
import { AuthSkeleton } from "@/components/ui/PageSkeletons";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Forgot Password | Colors by Nisha Vijay",
  description: "Reset your password for Colors by Nisha Vijay.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthPage mode="forgot" />
    </Suspense>
  );
}
