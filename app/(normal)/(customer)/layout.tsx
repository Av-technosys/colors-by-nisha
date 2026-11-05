import { Suspense, type ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountSidebarProfile, SidebarProfileSkeleton } from "@/components/account/AccountSidebarProfile";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-[#faf9f6] py-10 text-ink md:py-14">
    <Container>
      <AccountHeader />
      <div className="grid items-start gap-7 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-9">
        <AccountSidebar><Suspense fallback={<SidebarProfileSkeleton />}><AccountSidebarProfile /></Suspense></AccountSidebar>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  </main>;
}
