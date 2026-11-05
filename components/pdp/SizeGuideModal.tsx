"use client";

import React, { useState } from "react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"inches" | "cm">("inches");

  if (!isOpen) return null;

  const measurements = [
    { size: "XS", bustIn: "32-34", waistIn: "26-28", hipIn: "34-36", lengthIn: "42", bustCm: "81-86", waistCm: "66-71", hipCm: "86-91", lengthCm: "107" },
    { size: "S", bustIn: "34-36", waistIn: "28-30", hipIn: "36-38", lengthIn: "42", bustCm: "86-91", waistCm: "71-76", hipCm: "91-97", lengthCm: "107" },
    { size: "M", bustIn: "36-38", waistIn: "30-32", hipIn: "38-40", lengthIn: "43", bustCm: "91-97", waistCm: "76-81", hipCm: "97-102", lengthCm: "109" },
    { size: "L", bustIn: "38-40", waistIn: "32-34", hipIn: "40-42", lengthIn: "43", bustCm: "97-102", waistCm: "81-86", hipCm: "102-107", lengthCm: "109" },
    { size: "XL", bustIn: "40-42", waistIn: "34-36", hipIn: "42-44", lengthIn: "43.5", bustCm: "102-107", waistCm: "86-91", hipCm: "107-112", lengthCm: "110" },
    { size: "XXL", bustIn: "42-44", waistIn: "36-38", hipIn: "44-46", lengthIn: "44", bustCm: "107-112", waistCm: "91-97", hipCm: "112-117", lengthCm: "112" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      style={{ overscrollBehavior: "contain" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Size Guide"
    >
      <div
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-md bg-white p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="font-display text-xl font-medium tracking-wide uppercase text-ink">Size Guide</h2>
            <p className="text-xs text-neutral-500">Standard measurements for lehengas & ethnic ensembles</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100"
            aria-label="Close size guide"
          >
            ✕
          </button>
        </div>

        {/* Unit switch */}
        <div className="mt-4 flex items-center justify-end gap-2 text-xs">
          <span className="text-neutral-500">Unit:</span>
          <button
            onClick={() => setUnit("inches")}
            className={`rounded-md px-2.5 py-1 font-semibold transition ${
              unit === "inches" ? "bg-ink text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            Inches
          </button>
          <button
            onClick={() => setUnit("cm")}
            className={`rounded-md px-2.5 py-1 font-semibold transition ${
              unit === "cm" ? "bg-ink text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            CM
          </button>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 font-semibold uppercase tracking-wider text-neutral-700">
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Bust</th>
                <th className="py-2.5 px-3">Waist</th>
                <th className="py-2.5 px-3">Hip</th>
                <th className="py-2.5 px-3">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {measurements.map((row) => (
                <tr key={row.size} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-semibold text-ink">{row.size}</td>
                  <td className="py-2.5 px-3 text-neutral-600">{unit === "inches" ? row.bustIn : row.bustCm}</td>
                  <td className="py-2.5 px-3 text-neutral-600">{unit === "inches" ? row.waistIn : row.waistCm}</td>
                  <td className="py-2.5 px-3 text-neutral-600">{unit === "inches" ? row.hipIn : row.hipCm}</td>
                  <td className="py-2.5 px-3 text-neutral-600">{unit === "inches" ? row.lengthIn : row.lengthCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-md bg-[#faf8f5] p-3 text-[11px] text-neutral-600 leading-relaxed border border-[#ebdccf]">
          <strong>Need Custom Measurements?</strong> We offer complimentary bespoke sizing on all couture lehengas. Select &quot;Custom Fit&quot; upon checkout or chat with us on WhatsApp for tailoring assistance.
        </div>
      </div>
    </div>
  );
}

