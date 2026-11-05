import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/helpers/auth/access";
import { listOrders } from "@/helpers/orders/service";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { PageHeading } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Orders" };

async function Orders({ searchParams }: { searchParams: Promise<{ page?: string; query?: string; status?: string }> }) {
  await requireAdmin();
  const filters = await searchParams;
  const data = await listOrders(filters);
  return <><PageHeading eyebrow="From atelier to doorstep" title="Orders" description="View customer orders and manage delivery progress." /><OrdersTable data={data} admin query={filters.query} status={filters.status} /></>;
}
export default function OrdersPage(props: { searchParams: Promise<{ page?: string; query?: string; status?: string }> }) {
  return <Suspense fallback={<TableSkeleton />}><Orders {...props} /></Suspense>;
}
