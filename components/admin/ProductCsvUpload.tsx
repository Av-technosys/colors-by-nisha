"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadProductsCsv } from "@/app/admin/products/actions";

export function ProductCsvUpload({ onImportSuccess }: { onImportSuccess?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a .csv file");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await uploadProductsCsv(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Success! Added ${res.count} products to the database.`);
        onImportSuccess?.();
      }
    } catch {
      toast.error("Something went wrong while uploading CSV.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#e5e1da] bg-white px-4 font-display text-sm text-purple hover:bg-[#fbfaf8] disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        <span>{loading ? "Uploading CSV…" : "Upload CSV"}</span>
      </button>
    </div>
  );
}

