"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { CatalogData, CatalogRow } from "@/helpers/admin/catalog";
import type { ActionState } from "@/helpers/admin/validation";
import { PageHeading, StatusBadge } from "./AdminUI";
import { ProductCsvUpload } from "./ProductCsvUpload";

type CatalogTableProps = {
  title: string;
  singular: string;
  description: string;
  basePath: string;
  columns: string[];
  statuses?: string[];
  showCategoryFilter?: boolean;
  loadAction: () => Promise<CatalogData>;
  deleteAction: (id: string) => Promise<ActionState>;
};

export function CatalogTable({ title, singular, description, basePath, columns, statuses = [], showCategoryFilter = false, loadAction, deleteAction }: CatalogTableProps) {
  const [data, setData] = useState<CatalogData>({ records: [] });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const records = data.records;
  const categories = data.categories ?? [];
  const columnCount = columns.length + 2 + Number(statuses.length > 0);

  useEffect(() => {
    let cancelled = false;
    loadAction().then(result => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setData({ records: [], error: "The records could not be loaded. Please try again." });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [loadAction, reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey(current => current + 1);
  }
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<CatalogRow | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const closeDelete = useCallback(() => {
    if (pending) return;
    setDeleting(null);
    setError("");
  }, [pending]);
  const filtered = records.filter(record => {
    const text = [record.name, record.slug, ...Object.values(record.fields)].join(" ").toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (!status || record.status === status) && (!categoryId || record.categoryId === categoryId);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * 10;

  function confirmDelete() {
    if (!deleting || pending) return;
    setError("");
    startTransition(async () => {
      try {
        const result = await deleteAction(deleting.id);
        if (result.error) { setError(result.error); return; }
        closeDelete();
        reload();
      } catch {
        setError("Could not delete this record. Please try again.");
      }
    });
  }

  return (
    <>
      <PageHeading
        eyebrow={title}
        title={title}
        description={description}
        action={(
          <div className="flex items-center gap-3">
            {basePath === "/admin/products" && <ProductCsvUpload onImportSuccess={reload} />}
            <Link
              href={`${basePath}/new`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-purple px-4 font-display text-sm text-white"
            >
              <Plus size={17} />
              Add {singular}
            </Link>
          </div>
        )}
      />
      <div className="overflow-hidden rounded-md border border-[#e8e5df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeae4] p-5">
          <h2 className="font-display text-lg">All {title.toLowerCase()} <span className="ml-2 rounded-md bg-[#f2eff6] px-2 py-1 text-xs text-purple">{loading ? "—" : records.length}</span></h2>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <label className="relative min-w-0 flex-1 sm:w-60">
              <span className="sr-only">Search {title.toLowerCase()}</span><Search size={16} className="absolute left-3 top-3.5 text-neutral-400" aria-hidden="true" />
              <input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder={`Search ${title.toLowerCase()}…`} className="min-h-11 w-full rounded-md border border-[#e5e1da] pl-9 pr-3 text-xs" />
            </label>
            {!!statuses.length && <label><span className="sr-only">Status</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="min-h-11 rounded-md border border-[#e5e1da] px-3 text-xs"><option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ")}</option>)}</select></label>}
            {showCategoryFilter && (
              <label>
                <span className="sr-only">Category</span>
                <select disabled={loading} value={categoryId} onChange={event => { setCategoryId(event.target.value); setPage(1); }} className="min-h-11 rounded-md border border-[#e5e1da] bg-white px-3 text-xs">
                  <option value="">All categories</option>
                  {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table aria-busy={loading} className="w-full whitespace-nowrap text-left text-xs">
            <caption className="sr-only">{loading ? `Loading ${title.toLowerCase()}` : title}</caption>
            <thead className="bg-[#fbfaf8] text-[10px] uppercase tracking-wide text-neutral-400"><tr><th scope="col" className="px-5 py-4 font-normal">Name</th>{columns.map(column => <th key={column} scope="col" className="px-5 py-4 font-normal">{column}</th>)}{!!statuses.length && <th scope="col" className="px-5 py-4 font-normal">Status</th>}<th scope="col" className="px-5 py-4 font-normal">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#f0ede8]">
              {loading ? Array.from({ length: 5 }, (_, index) => (
                <tr key={index} aria-hidden="true">
                  {Array.from({ length: columnCount }, (_, column) => <td key={column} className="px-5 py-6"><span className="block h-4 w-24 max-w-full rounded-md bg-[#f0ede8] motion-safe:animate-pulse" /></td>)}
                </tr>
              )) : data.error ? (
                <tr><td colSpan={columnCount} className="px-5 py-12 text-center">
                  <p role="alert" className="whitespace-normal text-sm text-neutral-500">{data.error}</p>
                  <button onClick={reload} className="mt-4 min-h-10 rounded-md border border-[#e5e1da] px-4 text-xs text-purple">Try again</button>
                </td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan={columnCount} className="px-5 py-12 text-center">
                  <p className="font-display text-lg">{records.length ? "No matching records" : `No ${title.toLowerCase()} yet`}</p>
                  <p className="mt-2 whitespace-normal text-xs text-neutral-400">{records.length ? "Try a different search or filter." : `Add your first ${singular} to get started.`}</p>
                </td></tr>
              ) : filtered.slice(start, start + 10).map(record => (
              <tr key={record.id} className="hover:bg-[#fcfbf9]">
                <td className="px-5 py-5"><Link href={`${basePath}/${record.id}/edit`} className="block font-display text-sm text-purple hover:underline">{record.name}</Link><span className="mt-1 block max-w-64 truncate text-[10px] text-neutral-400">/{record.slug}</span></td>
                {columns.map(column => <td key={column} className="px-5 py-5 text-neutral-500">{record.fields[column]}</td>)}
                {!!statuses.length && <td className="px-5 py-5"><StatusBadge status={record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : "Draft"} /></td>}
                <td className="px-5 py-5"><div className="flex items-center gap-2"><Link href={`${basePath}/${record.id}/edit`} aria-label={`Edit ${record.name}`} className="grid size-9 place-items-center rounded-md text-purple hover:bg-[#f1edf5]"><Pencil size={16} /></Link><button onClick={() => { setDeleting(record); setError(""); }} aria-label={`Delete ${record.name}`} className="grid size-9 place-items-center rounded-md text-[#a16b60] hover:bg-[#f7eeec]"><Trash2 size={16} /></button></div></td>
              </tr>
            ))}
            </tbody>
          </table>

        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eeeae4] px-5 py-4 text-[10px] text-neutral-400"><p>Showing {filtered.length ? start + 1 : 0}–{Math.min(start + 10, filtered.length)} of {filtered.length}</p><div className="flex items-center gap-3"><button disabled={loading || !!data.error || currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page" className="grid size-8 place-items-center rounded-md border border-[#e8e5df] disabled:opacity-30"><ChevronLeft size={14} /></button>{currentPage} / {pageCount}<button disabled={loading || !!data.error || currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Next page" className="grid size-8 place-items-center rounded-md border border-[#e8e5df] disabled:opacity-30"><ChevronRight size={14} /></button></div></div>
      </div>
      {deleting && <Modal title={`Delete ${singular}`} onClose={closeDelete} className="w-full max-w-md p-6 sm:p-8"><h2 className="pr-6 font-display text-2xl">Delete {singular}?</h2><p className="mt-3 text-sm text-neutral-500">“{deleting.name}” will be permanently deleted.{singular === "product" && " Its variants and media records will also be removed."}</p>{error && <p role="alert" className="mt-4 rounded-md bg-[#f7eeec] p-3 text-xs text-[#a16b60]">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button disabled={pending} onClick={closeDelete} className="min-h-11 px-4 text-sm text-neutral-500">Cancel</button><button disabled={pending} onClick={confirmDelete} className="min-h-11 rounded-md bg-[#9c554c] px-4 text-sm text-white disabled:opacity-50">{pending ? "Deleting…" : `Delete ${singular}`}</button></div></Modal>}
    </>
  );
}
