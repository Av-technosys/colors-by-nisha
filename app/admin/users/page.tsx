import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { and, asc, count, desc, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { PageHeading, StatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/helpers/auth/access";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Users" };
const pageSize = 20;
type Search = { q?: string; status?: string; page?: string };

async function CustomerList({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 200);
  const status = ["all", "deleted"].includes(params.status ?? "") ? params.status! : "active";
  const search = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const where = and(
    status === "active" ? isNull(users.deletedAt) : status === "deleted" ? isNotNull(users.deletedAt) : undefined,
    query ? or(ilike(users.fullName, search), ilike(users.email, search), ilike(users.mobile, search)) : undefined,
  );
  const [totals] = await db.select({ value: count() }).from(users).where(where);
  const pageCount = Math.max(1, Math.ceil(totals.value / pageSize));
  const page = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), pageCount);
  const records = await db.select().from(users).where(where).orderBy(desc(users.createdAt), asc(users.id)).limit(pageSize).offset((page - 1) * pageSize);
  const pageUrl = (value: number) => `/admin/users?${new URLSearchParams({ q: query, status, page: String(value) })}`;

  return <>
    <PageHeading eyebrow="Your community" title="Users" description="Customer accounts registered with Colors by Nisha." />
    <div className="overflow-hidden rounded-md border border-[#e8e5df] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeae4] p-5">
        <h2 className="font-display text-lg">All customers <span className="ml-2 rounded-md bg-[#f2eff6] px-2 py-1 text-xs text-purple">{totals.value}</span></h2>
        <form className="flex w-full flex-wrap gap-2 sm:w-auto">
          <label className="min-w-0 flex-1"><span className="sr-only">Search customers</span><input name="q" defaultValue={query} placeholder="Search name, email or mobile…" className="min-h-11 w-full rounded-md border border-[#e5e1da] px-3 text-xs outline-none focus:border-purple sm:w-64" /></label>
          <label><span className="sr-only">Account status</span><select name="status" defaultValue={status} className="min-h-11 rounded-md border border-[#e5e1da] bg-white px-3 text-xs"><option value="active">Active accounts</option><option value="deleted">Deleted accounts</option><option value="all">All accounts</option></select></label>
          <button className="min-h-11 rounded-md bg-purple px-4 text-xs text-white">Search</button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-xs">
          <caption className="sr-only">Registered customer accounts</caption>
          <thead className="bg-[#fbfaf8] text-[10px] uppercase tracking-wide text-neutral-400"><tr>{["Customer", "Mobile", "Email verified", "Mobile verified", "Password", "Joined", "Status"].map(label => <th key={label} scope="col" className="px-5 py-4 font-normal">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#f0ede8]">{records.map(user => <tr key={user.id} className="hover:bg-[#fcfbf9]">
            <td className="px-5 py-4"><p className="font-display text-sm">{user.fullName}</p><p className="mt-1 text-neutral-400">{user.email || "—"}</p></td>
            <td className="px-5 py-4 text-neutral-500">{user.mobile || "—"}</td>
            <td className="px-5 py-4 text-neutral-500">{user.emailVerified ? "Verified" : "Unverified"}</td>
            <td className="px-5 py-4 text-neutral-500">{user.mobileVerified ? "Verified" : "Unverified"}</td>
            <td className="px-5 py-4 text-neutral-500">{user.passwordEnabled ? "Set" : "Not set"}</td>
            <td className="px-5 py-4 text-neutral-500">{user.createdAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
            <td className="px-5 py-4"><StatusBadge status={user.deletedAt ? "Inactive" : "Active"} /></td>
          </tr>)}</tbody>
        </table>
        {!records.length && <p className="px-5 py-16 text-center text-sm text-neutral-500">{query ? "No customers match your search." : "No customer accounts yet."}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeae4] px-5 py-4 text-xs text-neutral-500">
        <span>{totals.value ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totals.value)} of ${totals.value}` : "0 customers"}</span>
        <div className="flex items-center gap-3">{page > 1 && <Link href={pageUrl(page - 1)} className="rounded-md border border-[#e5e1da] px-3 py-2 text-purple">Previous</Link>}<span>Page {page} of {pageCount}</span>{page < pageCount && <Link href={pageUrl(page + 1)} className="rounded-md border border-[#e5e1da] px-3 py-2 text-purple">Next</Link>}</div>
      </div>
    </div>
  </>;
}

export default function UsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  return <Suspense fallback={<TableSkeleton />}><CustomerList searchParams={searchParams} /></Suspense>;
}
