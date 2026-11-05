import { AdminDashboardSkeleton } from "@/components/ui/PageSkeletons";
import { Dashboard } from "@/components/admin/Dashboard";
import { Suspense } from "react";
import { getAdminDashboard } from "@/helpers/admin/dashboard";

async function Overview() {
  return <Dashboard data={await getAdminDashboard()} />;
}

export default function AdminPage() {
  return <Suspense fallback={<AdminDashboardSkeleton />}><Overview /></Suspense>;
}
