import { Dashboard } from "@/components/admin/Dashboard";
import { Suspense } from "react";
import { requireAdmin } from "@/helpers/auth/access";
import { listOrders } from "@/helpers/orders/service";

async function Overview() {
  await requireAdmin();
  return <Dashboard orders={await listOrders()} />;
}

export default function AdminPage() {
  return <Suspense fallback={<p className="py-16 text-sm text-neutral-500">Loading dashboard…</p>}><Overview /></Suspense>;
}
