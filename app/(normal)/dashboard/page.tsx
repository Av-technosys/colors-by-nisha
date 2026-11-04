import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardPageContent from "@/components/account/DashboardPageContent";
import { readAccount } from "@/helpers/auth/account";
import { syncUser } from "@/helpers/auth/users";

async function Account() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const record = await syncUser(user);
  if (!record || record.deletedAt) redirect("/login");
  return <DashboardPageContent initialAccount={readAccount(user)} />;
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#faf9f6]/80" />}><Account /></Suspense>;
}
