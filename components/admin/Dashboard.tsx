import Link from "next/link";
import { ArrowRight, CreditCard, FileText, Mail, Package, Plus, ShoppingBag, Users } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { orderPage, productPage } from "@/data/admin";
import { PageHeading, StatusBadge } from "./AdminUI";
import { RevenueChart } from "./RevenueChart";

const stats = [
  { label: "Collected payments", value: "₹1,06,000", note: "3 paid sample transactions", icon: CreditCard },
  { label: "Total orders", value: "6", note: "2 orders awaiting fulfilment", icon: ShoppingBag },
  { label: "Collection pieces", value: "6", note: "2 products running low on stock", icon: Package },
  { label: "Your customers", value: "6", note: "5 active customer profiles", icon: Users },
];

export function Dashboard() {
  return (
    <>
      <PageHeading
        eyebrow="Your store, at a glance"
        title="A beautiful day to create."
        description="Welcome back, Nisha. Here’s a little perspective on your store."
        action={(
          <Link href="/admin/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-purple px-4 font-display text-sm text-white transition-colors hover:bg-[#40345f]">
            <Plus size={17} aria-hidden="true" />Add to your collection
          </Link>
        )}
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="overflow-hidden rounded-xl border border-[#e8e5df] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <span className="rounded-lg bg-[#f5f2f8] p-2 text-[#8e7ba7]"><stat.icon size={17} aria-hidden="true" /></span>
            </div>
            <p className="font-display text-[30px] leading-none text-purple">{stat.value}</p>
            <p className="mt-3 text-[10px] text-neutral-400">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mb-7 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <RevenueChart />
        <section className="flex flex-col overflow-hidden rounded-xl border border-[#e8e5df] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">The collection edit</h2>
            <span className="text-[#b18b53]"><Package size={20} aria-hidden="true" /></span>
          </div>
          <p className="mb-6 mt-1 text-[11px] text-neutral-400">Pieces that deserve a little attention.</p>
          <div className="space-y-5">
            {productPage.records.slice(0, 3).map((product, index) => (
              <Link key={product.id} href="/admin/products" className="group flex items-center gap-3">
                <span className="text-[10px] text-neutral-300">0{index + 1}</span>
                <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md">
                  {product.image && <Photo id={product.image} alt={product.title} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-sm group-hover:text-purple">{product.title}</span>
                  <span className="mt-1 block text-[10px] text-neutral-400">{product.fields.Category}</span>
                </span>
                <span className="text-[11px] text-neutral-500">{product.fields.Price.replace("Rs. ", "₹").replace(".00", "")}</span>
              </Link>
            ))}
          </div>
          <Link href="/admin/products" className="mt-6 flex items-center justify-between border-t border-[#eeeae4] pt-4 text-xs text-purple">
            Explore your products<ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="mb-7 overflow-hidden rounded-xl border border-[#e8e5df] bg-white">
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
            <caption className="sr-only">Recent sample orders</caption>
            <thead className="bg-[#fbfaf8] text-[10px] uppercase tracking-[0.08em] text-neutral-400">
              <tr>
                {["Order", "Customer", "Date", "Amount", "Status"].map(label => (
                  <th key={label} scope="col" className="px-6 py-3 font-normal">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede8]">
              {orderPage.records.slice(0, 4).map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-display text-sm text-purple"><Link href="/admin/orders" className="hover:underline">{order.title}</Link></td>
                  <td className="px-6 py-4 text-neutral-500">{order.fields.Customer}</td>
                  <td className="px-6 py-4 text-neutral-400">{order.fields.Date}</td>
                  <td className="px-6 py-4">{order.fields.Amount}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/blogs" className="group flex items-center gap-4 overflow-hidden rounded-xl border border-[#e8e5df] bg-white p-5">
          <span className="rounded-lg bg-[#f2edf6] p-3 text-[#8c779d]"><FileText size={20} aria-hidden="true" /></span>
          <span className="flex-1">
            <span className="block font-display text-base">Tell your next story</span>
            <span className="text-[11px] text-neutral-400">One journal draft is waiting for your touch.</span>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href="/admin/contact" className="group flex items-center gap-4 overflow-hidden rounded-xl border border-[#e8e5df] bg-white p-5">
          <span className="rounded-lg bg-[#f7f0e3] p-3 text-[#ad8c56]"><Mail size={20} aria-hidden="true" /></span>
          <span className="flex-1">
            <span className="block font-display text-base">A conversation awaits</span>
            <span className="text-[11px] text-neutral-400">2 new messages from your community.</span>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
