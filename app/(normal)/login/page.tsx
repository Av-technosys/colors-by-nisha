import AuthPage from "@/components/auth/AuthPage";
import type { Metadata } from "next";
import { AuthSkeleton } from "@/components/ui/PageSkeletons";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | Colors by Nisha Vijay",
  description: "Sign in to access your saved heirlooms, custom orders and details at Colors by Nisha Vijay.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthPage mode="login" />
    </Suspense>
  );
}
