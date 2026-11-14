import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { asc, count, desc, ilike } from "drizzle-orm";
import { PageHeading } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/helpers/auth/access";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Subscriptions" };
const pageSize = 20;
type Search = { q?: string; page?: string };

async function SubscriptionList({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 200);
  const search = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const where = query ? ilike(subscriptions.email, search) : undefined;
  const [totals] = await db.select({ value: count() }).from(subscriptions).where(where);
  const pageCount = Math.max(1, Math.ceil(totals.value / pageSize));
  const page = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), pageCount);
  const records = await db.select().from(subscriptions).where(where).orderBy(desc(subscriptions.createdAt), asc(subscriptions.id)).limit(pageSize).offset((page - 1) * pageSize);
  const pageUrl = (value: number) => `/admin/subscriptions?${new URLSearchParams({ q: query, page: String(value) })}`;

  return <>
    <PageHeading eyebrow="Your community" title="Subscriptions" description="Newsletter signups collected through the store footer." />
    <div className="overflow-hidden rounded-md border border-[#e8e5df] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeae4] p-5">
        <h2 className="font-display text-lg">All subscribers <span className="ml-2 rounded-md bg-[#f2eff6] px-2 py-1 text-xs text-purple">{totals.value}</span></h2>
        <form className="flex w-full flex-wrap gap-2 sm:w-auto">
          <label className="min-w-0 flex-1"><span className="sr-only">Search subscribers</span><input name="q" defaultValue={query} placeholder="Search email…" className="min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-xs outline-none focus:border-purple sm:w-64" /></label>
          <button className="min-h-11 rounded-md bg-purple px-4 text-xs text-white">Search</button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-xs">
          <caption className="sr-only">Newsletter subscribers</caption>
          <thead className="bg-[#fbfaf8] text-[10px] uppercase tracking-wide text-neutral-400"><tr>{["Email", "Subscribed on"].map(label => <th key={label} scope="col" className="px-5 py-4 font-normal">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#f0ede8]">{records.map(subscription => <tr key={subscription.id} className="hover:bg-[#fcfbf9]">
            <td className="px-5 py-4">{subscription.email}</td>
            <td className="px-5 py-4 text-neutral-500">{subscription.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</td>
          </tr>)}</tbody>
        </table>
        {!records.length && <p className="px-5 py-16 text-center text-sm text-neutral-500">{query ? "No subscribers match your search." : "No subscriptions yet."}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeae4] px-5 py-4 text-xs text-neutral-500">
        <span>{totals.value ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totals.value)} of ${totals.value}` : "0 subscribers"}</span>
        <div className="flex items-center gap-3">{page > 1 && <Link href={pageUrl(page - 1)} className="rounded-md border border-[#e5e1da] px-3 py-2 text-purple">Previous</Link>}<span>Page {page} of {pageCount}</span>{page < pageCount && <Link href={pageUrl(page + 1)} className="rounded-md border border-[#e5e1da] px-3 py-2 text-purple">Next</Link>}</div>
      </div>
    </div>
  </>;
}

export default function SubscriptionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return <Suspense fallback={<TableSkeleton />}><SubscriptionList searchParams={searchParams} /></Suspense>;
}
