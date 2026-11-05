import Link from "next/link";
import { formatINR } from "@/data/products";
import { orderReference, type listOrders } from "@/helpers/orders/service";
import { orderStatuses, statusLabels } from "@/helpers/orders/input";
import { StatusBadge } from "@/components/admin/AdminUI";

export function OrdersTable({ data, admin = false, query = "", status = "" }: {
  data: Awaited<ReturnType<typeof listOrders>>; admin?: boolean; query?: string; status?: string;
}) {
  const base = admin ? "/admin/orders" : "/orders";
  const href = (page: number) => `${base}?${new URLSearchParams({ ...(query ? { query } : {}), ...(status ? { status } : {}), page: String(page) })}`;
  return <section className="min-w-0 overflow-hidden rounded-md border border-[#e8e5df] bg-white">
    <form action={base} className="flex flex-wrap items-center gap-3 border-b border-[#eeeae4] p-5">
      <label className="min-w-0 basis-full sm:basis-0 sm:flex-1"><span className="sr-only">Search orders</span><input name="query" defaultValue={query} maxLength={100} placeholder={admin ? "Search order ID, customer or email" : "Search order ID"} className="min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-xs outline-none focus:border-purple" /></label>
      <label><span className="sr-only">Order status</span><select name="status" defaultValue={status} className="min-h-11 rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple"><option value="">All statuses</option>{orderStatuses.map(item => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></label>
      <button className="min-h-11 rounded-md bg-purple px-5 text-xs text-white">Filter</button>{(query || status) && <Link href={base} className="text-xs text-neutral-500 underline underline-offset-4">Clear</Link>}
    </form>
    <div className="overflow-x-auto" role="region" aria-label="Order list" tabIndex={0}><table className="w-full whitespace-nowrap text-left text-xs"><caption className="sr-only">Orders</caption><thead className="bg-[#fbfaf8] text-[10px] uppercase tracking-[0.08em] text-neutral-400"><tr>{["Order", ...(admin ? ["Customer"] : []), "Date", "Items total", "Status", ""].map((label, index) => <th key={index} scope="col" className="px-5 py-4 font-normal">{label || <span className="sr-only">Details</span>}</th>)}</tr></thead><tbody className="divide-y divide-[#f0ede8]">{data.rows.map(order => <tr key={order.id} className="hover:bg-[#fcfbf9]"><td className="px-5 py-4 font-display text-sm"><Link href={`${base}/${order.id}`} className="text-purple hover:underline">{orderReference(order.id)}</Link></td>{admin && <td className="px-5 py-4"><p>{order.customerName || "Deleted customer"}</p><p className="mt-1 text-[11px] text-neutral-400">{order.customerEmail}</p></td>}<td className="px-5 py-4 text-neutral-500">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(order.createdAt)}</td><td className="px-5 py-4">{formatINR(Number(order.totalAmount))}</td><td className="px-5 py-4"><StatusBadge status={order.status} /></td><td className="px-5 py-4"><Link href={`${base}/${order.id}`} className="inline-flex min-h-10 items-center text-purple hover:underline">View order →</Link></td></tr>)}</tbody></table></div>
    {!data.rows.length && <div className="px-5 py-16 text-center"><h2 className="font-display text-xl">{query || status ? "No matching orders" : "No orders yet"}</h2><p className="mt-2 text-xs text-neutral-400">{admin ? "Customer orders will appear here when placed." : "Your orders and delivery updates will appear here."}</p></div>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeae4] px-5 py-4 text-xs text-neutral-400"><p>{data.total} order{data.total === 1 ? "" : "s"}</p><nav aria-label="Order pages" className="flex items-center gap-4">{data.page > 1 && <Link href={href(Math.min(data.page - 1, data.pageCount))} className="text-purple">Previous</Link>}<span>Page {data.page} of {data.pageCount}</span>{data.page < data.pageCount && <Link href={href(data.page + 1)} className="text-purple">Next</Link>}</nav></div>
  </section>;
}
