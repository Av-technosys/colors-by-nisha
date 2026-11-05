import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardPageContent from "@/components/account/DashboardPageContent";
import { getCustomerAccount } from "@/helpers/auth/addresses";

async function Account() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { account } = await getCustomerAccount(user);
  return <DashboardPageContent initialAccount={account} />;
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#faf9f6]/80" />}><Account /></Suspense>;
}
