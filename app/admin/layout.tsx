import { requireAdmin } from "@/helpers/auth/access";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Dashboard | Colors by Nisha", template: "%s | Colors by Nisha Admin" },
  robots: { index: false, follow: false },
};

async function AuthorizedAdmin({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthorizedAdmin>{children}</AuthorizedAdmin>
    </Suspense>
  );
}

