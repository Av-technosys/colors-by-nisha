import Link from "next/link";
import { listOrders, orderReference } from "@/helpers/orders/service";
import { formatINR } from "@/data/products";
import { StatusBadge } from "@/components/admin/AdminUI";

export async function RecentOrders({ clerkId }: { clerkId: string }) {
  const data = await listOrders({ clerkId }).catch(() => null);
  if (!data) return <section className="rounded-md border border-[#e8e3da] bg-white p-6"><h2 className="font-display text-xl">Your orders</h2><p className="mt-3 text-sm text-neutral-500">Order updates could not be loaded.</p><Link href="/orders" className="mt-4 inline-block text-sm text-purple underline">View orders</Link></section>;
    return <section aria-labelledby="recent-orders-title" className="rounded-md border border-[#e8e3da] bg-white p-5 md:p-7">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 id="recent-orders-title" className="font-display text-xl">Your orders</h2><Link href="/orders" className="text-xs text-purple underline underline-offset-4">View all</Link></div>
      <dl className="mb-5 grid grid-cols-3 gap-3">{[["Orders", data.total], ["Paid", data.paidCount], ["In progress", data.activeCount]].map(([label, value]) => <div key={label} className="rounded-md bg-[#f7f5f1] p-3"><dt className="text-[11px] text-neutral-500">{label}</dt><dd className="mt-2 font-display text-2xl text-purple">{value}</dd></div>)}</dl>
      {!data.rows.length ? <div className="py-5 text-center"><p className="font-display text-lg">Your first piece is waiting</p><p className="mt-2 text-xs text-neutral-500">Orders and delivery updates will appear here.</p><Link href="/shop" className="mt-4 inline-block text-sm text-purple underline underline-offset-4">Explore the collection</Link></div> : <div className="divide-y divide-[#eeeae4]">{data.rows.slice(0, 3).map(order => <Link key={order.id} href={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-display text-sm text-purple">{orderReference(order.id)}</p><p className="mt-1 text-xs text-neutral-600">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(order.createdAt)} · {formatINR(Number(order.totalAmount))}</p></div><div className="text-right"><StatusBadge status={order.status} />{!order.paidAt && order.status === "pending" && <p className="mt-2 text-[11px] text-purple">Complete payment →</p>}</div></Link>)}</div>}
    </section>;
}
