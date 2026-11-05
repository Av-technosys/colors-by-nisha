import { Modal } from "@/components/ui/Modal";
import { Photo } from "@/components/ui/Photo";
import type { AdminPageData, AdminRecord } from "@/data/admin";
import { StatusBadge } from "./AdminUI";

type RecordDetailsProps = {
  data: AdminPageData;
  record: AdminRecord;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
};

export function RecordDetails({ data, record, onClose, onEdit, onStatusChange }: RecordDetailsProps) {
  return (
    <Modal title={`${data.singular} details`} onClose={onClose} className="w-full max-w-lg p-6 sm:p-8">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#94764d]">{data.singular} details</p>
      <h2 className="pr-5 font-display text-2xl">{record.title}</h2>
      <p className="mb-5 mt-1 text-xs text-neutral-400">{record.subtitle}</p>

      {record.image && (
        <div className="relative mb-5 h-56 overflow-hidden rounded-md bg-[#f7f6f3]">
          <Photo id={record.image} alt={record.title} contain />
        </div>
      )}

      <dl className="mb-5 divide-y divide-neutral-100 text-xs">
        {data.columns.slice(1).map(column => (
          <div key={column} className="flex flex-col gap-2 py-3 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-neutral-400">{column}</dt>
            <dd className="min-w-0 break-words sm:text-right">{record.fields[column]}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between py-3">
          <dt className="text-neutral-400">Status</dt>
          <dd><StatusBadge status={record.status} /></dd>
        </div>
      </dl>

      {record.detail && (
        <p className="mb-6 rounded-md bg-[#f7f6f3] p-4 text-xs leading-relaxed text-neutral-600">{record.detail}</p>
      )}
      {data.canEdit && (
        <button onClick={onEdit} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-purple px-4 font-display text-sm text-white transition-colors hover:bg-[#40345f]">
          Edit {data.singular}
        </button>
      )}
      {data.canChangeStatus && (
        <label className="block text-xs text-neutral-500">
          Update status
          <select
            value={record.status}
            onChange={event => onStatusChange(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          >
            {data.statuses.map(status => <option key={status}>{status}</option>)}
          </select>
        </label>
      )}
    </Modal>
  );
}
