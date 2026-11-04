"use client";

import { useCallback, useState } from "react";
import { ChevronRight, Plus, Search, X } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import type { AdminPageData, AdminRecord } from "@/data/admin";
import { PageHeading, StatusBadge } from "./AdminUI";
import { RecordDetails } from "./RecordDetails";
import { RecordForm } from "./RecordForm";

const pageSize = 5;

export function RecordsPage({ data }: { data: AdminPageData }) {
  const [records, setRecords] = useState(data.records);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AdminRecord | null>(null);
  const [dialog, setDialog] = useState<"details" | "form" | null>(null);
  const [notice, setNotice] = useState("");
  const closeDialog = useCallback(() => setDialog(null), []);
  const columns = data.columns.slice(1);
  const search = query.trim().toLowerCase();

  const filteredRecords = records.filter(record => {
    const text = [record.title, record.subtitle, record.id, ...Object.values(record.fields)].join(" ");
    const matchesSearch = text.toLowerCase().includes(search);
    const matchesStatus = status === "All statuses" || record.status === status;
    return matchesSearch && matchesStatus;
  });

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleRecords = filteredRecords.slice(start, start + pageSize);

  function resetFilters() {
    setQuery("");
    setStatus("All statuses");
    setPage(1);
  }

  function addRecord() {
    setSelectedRecord(null);
    setDialog("form");
  }

  function viewRecord(record: AdminRecord) {
    setSelectedRecord(record);
    setDialog("details");
  }

  function saveRecord(record: AdminRecord) {
    if (selectedRecord) {
      setRecords(current => current.map(item => item.id === record.id ? record : item));
    } else {
      setRecords(current => [{ ...record, id: `DRAFT-${current.length + 1}` }, ...current]);
    }

    const label = data.singular.charAt(0).toUpperCase() + data.singular.slice(1);
    setNotice(`${label} ${selectedRecord ? "updated" : "added"} in this preview. Changes reset when you reload.`);
    closeDialog();
    resetFilters();
  }

  function changeStatus(status: string) {
    if (!selectedRecord) return;
    const updated = { ...selectedRecord, status };
    setSelectedRecord(updated);
    setRecords(current => current.map(record => record.id === updated.id ? updated : record));
    setNotice("Status updated in this preview. Changes reset when you reload.");
  }

  return (
    <>
      <PageHeading
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        action={data.canEdit && (
          <button onClick={addRecord} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-purple px-4 font-display text-sm text-white transition-colors hover:bg-[#40345f]">
            <Plus size={17} aria-hidden="true" />
            Add {data.singular}
          </button>
        )}
      />

      {notice && (
        <div role="status" className="mb-5 flex items-center justify-between gap-4 rounded-md border border-[#dce7db] bg-[#edf4ed] px-4 py-3 text-xs text-[#517254]">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} aria-hidden="true" /></button>
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-[#e8e5df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeae4] p-5">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg">All {data.title.toLowerCase()}</h2>
            <span className="rounded-md bg-[#f2eff6] px-2 py-0.5 text-[10px] text-purple">{records.length}</span>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <label className="relative min-w-0 flex-1 sm:w-60">
              <span className="sr-only">Search {data.title.toLowerCase()}</span>
              <span className="pointer-events-none absolute left-3 top-3.5 text-neutral-400"><Search size={16} aria-hidden="true" /></span>
              <input
                value={query}
                onChange={event => { setQuery(event.target.value); setPage(1); }}
                placeholder={`Search ${data.title.toLowerCase()}…`}
                className="min-h-11 w-full rounded-md border border-[#e5e1da] bg-white pl-9 pr-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
              />
            </label>
            <label>
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={event => { setStatus(event.target.value); setPage(1); }}
                className="min-h-11 min-w-32 rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
              >
                <option>All statuses</option>
                {data.statuses.map(status => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-xs">
            <caption className="sr-only">{data.title} sample records</caption>
            <thead className="bg-[#fbfaf8] text-[10px] uppercase tracking-[0.08em] text-neutral-400">
              <tr>
                {data.columns.map(column => <th key={column} scope="col" className="px-5 py-4 font-normal">{column}</th>)}
                <th scope="col" className="px-5 py-4 font-normal">Status</th>
                <th scope="col" className="px-5 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede8]">
              {visibleRecords.map(record => (
                <tr key={record.id} className="transition-colors hover:bg-[#fcfbf9]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {record.image ? (
                        <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-[#f5f1eb]">
                          <Photo id={record.image} alt={record.title} />
                        </span>
                      ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#f1edf5] font-display text-sm text-[#8d7a9e]">
                          {record.title.replace(/^#/, "").split(" ").slice(0, 2).map(word => word[0]).join("")}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="max-w-64 truncate font-display text-sm">{record.title}</p>
                        <p className="mt-1 max-w-64 truncate text-[10px] text-neutral-400">{record.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  {columns.map(column => <td key={column} className="px-5 py-4 text-neutral-500">{record.fields[column]}</td>)}
                  <td className="px-5 py-4"><StatusBadge status={record.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => viewRecord(record)} aria-label={`View ${record.title}`} className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-[11px] text-purple hover:bg-[#f1edf5]">
                      View<ChevronRight size={13} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!visibleRecords.length && (
            <div className="px-5 py-16 text-center">
              <p className="font-display text-lg">No matches found</p>
              <p className="mt-1 text-xs text-neutral-400">Try another search or reset your filters.</p>
              <button onClick={resetFilters} className="mt-4 text-xs text-purple underline underline-offset-4">Clear filters</button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeae4] px-5 py-4 text-[10px] text-neutral-400">
          <p>Showing {filteredRecords.length ? start + 1 : 0}–{Math.min(start + pageSize, filteredRecords.length)} of {filteredRecords.length} {data.title.toLowerCase()}</p>
          <div className="flex items-center gap-2">
            <button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="grid size-8 rotate-180 place-items-center rounded-md border border-[#e8e5df] text-purple disabled:opacity-30">
              <ChevronRight size={13} aria-hidden="true" />
            </button>
            <span className="px-2">{currentPage} / {pageCount}</span>
            <button aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="grid size-8 place-items-center rounded-md border border-[#e8e5df] text-purple disabled:opacity-30">
              <ChevronRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {dialog === "details" && selectedRecord && (
        <RecordDetails
          data={data}
          record={selectedRecord}
          onClose={closeDialog}
          onEdit={() => setDialog("form")}
          onStatusChange={changeStatus}
        />
      )}
      {dialog === "form" && (
        <RecordForm data={data} record={selectedRecord} onSave={saveRecord} onClose={closeDialog} />
      )}
    </>
  );
}
