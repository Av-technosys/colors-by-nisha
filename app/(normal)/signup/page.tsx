import AuthPage from "@/components/auth/AuthPage";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Account | Colors by Nisha Vijay",
  description: "Join Colors by Nisha Vijay for handcrafted couture and exclusive heirloom collections.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthPage mode="signup" />
    </Suspense>
  );
}
