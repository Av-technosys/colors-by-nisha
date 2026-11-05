import AuthPage from "@/components/auth/AuthPage";
import type { Metadata } from "next";
import { AuthSkeleton } from "@/components/ui/PageSkeletons";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Account | Colors by Nisha Vijay",
  description: "Join Colors by Nisha Vijay for handcrafted couture and exclusive heirloom collections.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthPage mode="signup" />
    </Suspense>
  );
}
