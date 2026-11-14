import { Form } from "@/components/ui/Form";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import type { AdminPageData, AdminRecord } from "@/data/admin";

type RecordFormProps = {
  data: AdminPageData;
  record: AdminRecord | null;
  onSave: (record: AdminRecord) => void;
  onClose: () => void;
};

export function RecordForm({ data, record, onSave, onClose }: RecordFormProps) {
  const title = `${record ? "Edit" : "Add"} ${data.singular}`;
  const columns = data.columns.slice(1);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fields: Record<string, string> = {};

    for (const column of columns) {
      fields[column] = String(form.get(column) ?? "").trim();
    }

    onSave({
      id: record?.id ?? "",
      title: String(form.get("title") ?? "").trim(),
      subtitle: String(form.get("subtitle") ?? "").trim(),
      image: record?.image,
      fields,
      status: String(form.get("status")),
      detail: String(form.get("detail") ?? "").trim(),
    });
  }

  return (
    <Modal title={title} onClose={onClose} className="w-full max-w-xl p-6 sm:p-8">
      <h2 className="mb-1 pr-5 font-display text-2xl">{title}</h2>
      <p className="mb-6 text-xs text-neutral-400">Changes are saved in this preview only.</p>

      <Form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs text-neutral-500">
          {data.columns[0]} name
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={record?.title}
            className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          />
        </label>
        <label className="block text-xs text-neutral-500">
          Short description
          <input
            name="subtitle"
            maxLength={160}
            defaultValue={record?.subtitle}
            className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          {columns.map(column => (
            <label key={column} className="block text-xs text-neutral-500">
              {column}
              <input
                name={column}
                required
                maxLength={80}
                defaultValue={record?.fields[column]}
                className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
              />
            </label>
          ))}
          <label className="block text-xs text-neutral-500">
            Status
            <select
              name="status"
              defaultValue={record?.status ?? "Draft"}
              className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
            >
              {data.statuses.map(status => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>

        <label className="block text-xs text-neutral-500">
          {data.singular === "article" ? "Content" : "Description"}
          <textarea
            name="detail"
            rows={4}
            defaultValue={record?.detail}
            className="mt-2 min-h-11 w-full rounded-md border border-[#e5e1da] bg-white px-3 py-3 text-xs outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          />
        </label>

        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5">
          <button type="button" onClick={onClose} className="rounded-md px-4 text-xs text-neutral-500">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-purple px-4 font-display text-sm text-white transition-colors hover:bg-[#40345f]">
            Save {data.singular}
          </button>
        </div>
      </Form>
    </Modal>
  );
}
