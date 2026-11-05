import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardPageContent from "@/components/account/DashboardPageContent";
import { RecentOrders } from "@/components/account/RecentOrders";
import { AccountSkeleton } from "@/components/ui/PageSkeletons";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { getCustomerAccount } from "@/helpers/auth/addresses";

async function Account() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { account } = await getCustomerAccount(user);
  return <DashboardPageContent initialAccount={account}><Suspense fallback={<TableSkeleton heading={false} rows={3} />}><RecentOrders clerkId={user.id} /></Suspense></DashboardPageContent>;
}

export default function DashboardPage() {
  return <Suspense fallback={<AccountSkeleton />}><Account /></Suspense>;
}
