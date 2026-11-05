import Link from "next/link";
import { ArrowRight, CreditCard, FileText, Mail, Package, Plus, ShoppingBag, Users } from "lucide-react";
import { formatINR } from "@/data/products";
import { orderReference } from "@/helpers/orders/service";
import { PageHeading, StatusBadge } from "./AdminUI";
import { RevenueChart } from "./RevenueChart";
import type { AdminDashboardData } from "@/helpers/admin/dashboard";

export function Dashboard({ data }: { data: AdminDashboardData }) {
  const { metrics, recentOrders, lowStock } = data;
  const stats = [
    { label: "Gross collected", value: metrics ? formatINR(Number(metrics.collected)) : "—", note: metrics ? `${metrics.paid} paid orders · before refunds` : "Temporarily unavailable", icon: CreditCard },
    { label: "Total orders", value: metrics?.totalOrders ?? "—", note: metrics ? `${metrics.activeOrders} paid orders to fulfil` : "Temporarily unavailable", icon: ShoppingBag },
    { label: "Collection pieces", value: metrics?.totalProducts ?? "—", note: metrics ? `${metrics.activeProducts} active · ${metrics.lowStock} options low on stock` : "Temporarily unavailable", icon: Package },
    { label: "Customer profiles", value: metrics?.customers ?? "—", note: "Current customer accounts", icon: Users },
  ];
  return (
    <>
      <PageHeading
        eyebrow="Your store, at a glance"
        title="A beautiful day to create."
        description="Your latest payments, orders, and collection updates."
        action={(
          <Link href="/admin/products/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-purple px-4 font-display text-sm text-white transition-colors hover:bg-[#40345f]">
            <Plus size={17} aria-hidden="true" />Add to your collection
          </Link>
        )}
      />

      {data.unavailable && <p role="status" className="mb-6 rounded-md border border-[#e8e3da] bg-[#faf9f6] p-4 text-sm text-neutral-500">Some store information is temporarily unavailable. Please refresh to try again.</p>}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="overflow-hidden rounded-md border border-[#e8e5df] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <span className="rounded-md bg-[#f5f2f8] p-2 text-[#8e7ba7]"><stat.icon size={17} aria-hidden="true" /></span>
            </div>
            <p className="font-display text-[30px] leading-none text-purple">{stat.value}</p>
            <p className="mt-3 text-[10px] text-neutral-400">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mb-7 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <RevenueChart points={data.revenue} />
        <section className="flex flex-col overflow-hidden rounded-md border border-[#e8e5df] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Stock to review</h2>
            <span className="text-[#b18b53]"><Package size={20} aria-hidden="true" /></span>
          </div>
          <p className="mb-6 mt-1 text-[11px] text-neutral-400">Options with five or fewer pieces available.</p>
          <div className="space-y-5">
            {lowStock?.map(product => <Link key={product.id} href={`/admin/products/${product.productId}/edit`} className="group flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[#f5f2f8] text-[#8e7ba7]"><Package size={18} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate font-display text-sm group-hover:text-purple">{product.name}</span><span className="mt-1 block truncate text-[10px] text-neutral-400">{product.option}</span></span>
              <span className={`shrink-0 text-xs ${product.stock === 0 ? "text-[#9e5144]" : "text-[#94764d]"}`}>{product.stock === 0 ? "Out of stock" : `${product.stock} left`}</span>
            </Link>)}
            {(!lowStock || !lowStock.length) && <p className="py-8 text-sm text-neutral-400">{lowStock ? "No low-stock options to review." : "Stock information is temporarily unavailable."}</p>}

          </div>
          <Link href="/admin/products" className="mt-6 flex items-center justify-between border-t border-[#eeeae4] pt-4 text-xs text-purple">
            Explore your products<ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="mb-7 overflow-hidden rounded-md border border-[#e8e5df] bg-white">
        <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-display text-lg">Recent orders</h2>
            <p className="mt-1 text-[11px] text-neutral-400">The latest additions to someone’s wardrobe.</p>
          </div>
          <Link href="/admin/orders" className="flex items-center gap-2 whitespace-nowrap text-[11px] text-purple">
            View all<ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-xs">
            <caption className="sr-only">Recent orders</caption>
            <thead className="bg-[#fbfaf8] text-[10px] uppercase tracking-[0.08em] text-neutral-400">
              <tr>
                {["Order", "Customer", "Date", "Amount", "Status"].map(label => (
                  <th key={label} scope="col" className="px-6 py-3 font-normal">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede8]">
              {recentOrders?.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-display text-sm text-purple"><Link href={`/admin/orders/${order.id}`} className="hover:underline">{orderReference(order.id)}</Link></td>
                  <td className="px-6 py-4 text-neutral-500">{order.shippingName || order.customerName || "Customer"}</td>
                  <td className="px-6 py-4 text-neutral-400">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(order.createdAt)}</td>
                  <td className="px-6 py-4">{formatINR(Number(order.totalAmount))}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
              {(!recentOrders || !recentOrders.length) && <tr><td colSpan={5} className="px-6 py-10 text-center text-neutral-400">{recentOrders ? "No orders yet." : "Orders are temporarily unavailable."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/blogs" className="group flex items-center gap-4 overflow-hidden rounded-md border border-[#e8e5df] bg-white p-5">
          <span className="rounded-md bg-[#f2edf6] p-3 text-[#8c779d]"><FileText size={20} aria-hidden="true" /></span>
          <span className="flex-1">
            <span className="block font-display text-base">Tell your next story</span>
            <span className="text-[11px] text-neutral-400">{metrics ? `${metrics.drafts} saved journal ${metrics.drafts === 1 ? "draft" : "drafts"}.` : "View and manage your journal."}</span>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href="/admin/contact" className="group flex items-center gap-4 overflow-hidden rounded-md border border-[#e8e5df] bg-white p-5">
          <span className="rounded-md bg-[#f7f0e3] p-3 text-[#ad8c56]"><Mail size={20} aria-hidden="true" /></span>
          <span className="flex-1">
            <span className="block font-display text-base">A conversation awaits</span>
            <span className="text-[11px] text-neutral-400">{metrics ? `${metrics.enquiries} customer ${metrics.enquiries === 1 ? "enquiry" : "enquiries"}.` : "View customer enquiries."}</span>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
