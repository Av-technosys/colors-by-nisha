import type { Metadata } from "next";
import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listOrders } from "@/helpers/orders/service";
import { OrdersTable } from "@/components/orders/OrdersTable";

export const metadata: Metadata = { title: "Your orders | Colors by Nisha", robots: { index: false, follow: false } };
async function Orders({ searchParams }: { searchParams: Promise<{ page?: string; query?: string; status?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const filters = await searchParams;
  const data = await listOrders({ ...filters, clerkId: user.id });
  return <div className="mx-auto max-w-[1200px] px-5 py-10 md:py-14"><h1 className="mb-3 font-display text-3xl md:text-4xl">Your orders</h1><p className="mb-8 text-sm text-neutral-500">Your pieces, from our atelier to your doorstep.</p><OrdersTable data={data} query={filters.query} status={filters.status} /></div>;
}
export default function OrdersPage(props: { searchParams: Promise<{ page?: string; query?: string; status?: string }> }) {
  return <Suspense fallback={<p className="py-24 text-center text-sm text-neutral-500">Loading orders…</p>}><Orders {...props} /></Suspense>;
}
