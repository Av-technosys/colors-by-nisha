"use client";

import { useState } from "react";
import { formatINR } from "@/data/products";
import type { RevenuePoint } from "@/helpers/admin/dashboard";

const compact = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 });
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`));

export function RevenueChart({ points }: { points: RevenuePoint[] | null }) {
  const [period, setPeriod] = useState(7);
  const revenue = points?.slice(-period) ?? [];
  const total = revenue.reduce((sum, point) => sum + point.value, 0);
  const maximum = Math.max(1, ...revenue.map(point => point.value));
  const unit = 10 ** Math.floor(Math.log10(maximum));
  const ceiling = Math.ceil(maximum / unit) * unit;
  const ticks = [ceiling, ceiling * 0.75, ceiling * 0.5, ceiling * 0.25, 0];

  return <section className="min-w-0 overflow-hidden rounded-md border border-[#e8e5df] bg-white p-5 sm:p-6" aria-label="Collected payments chart">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="font-display text-lg">Payment overview</h2><p className="mt-1 text-[11px] text-neutral-400">Confirmed payments, grouped by payment date.</p></div>
      <label><span className="sr-only">Payment period</span><select value={period} onChange={event => setPeriod(Number(event.target.value))} className="min-h-10 rounded-md border border-[#e5e1da] bg-white px-3 text-xs outline-none focus:border-purple"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select></label>
    </div>
    {!points ? <p role="status" className="py-16 text-center text-sm text-neutral-500">Payment information is temporarily unavailable.</p> : <>
      <div className="mb-5 mt-6 flex flex-wrap items-baseline gap-3"><span className="break-all font-display text-3xl text-purple">{formatINR(total)}</span><span className="text-[10px] text-neutral-400">gross collected</span></div>
      <div className="flex h-48 gap-3 sm:h-56">
        <div aria-hidden="true" className="flex shrink-0 flex-col justify-between pb-7 text-[9px] text-neutral-400">{ticks.map((value, index) => <span key={index}>{compact.format(value)}</span>)}</div>
        <div className={`relative flex min-w-0 flex-1 border-b border-[#ece8e1] ${period === 7 ? "gap-2 sm:gap-4" : "gap-1"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between">{ticks.map((_, index) => <span key={index} className="border-t border-dashed border-[#eeeae4]" />)}</div>
          {revenue.map((point, index) => <div key={point.date} className="relative flex min-w-0 flex-1 flex-col justify-end">
            <div className="flex min-h-0 flex-1 items-end justify-center"><div title={`${dateLabel(point.date)}: ${formatINR(point.value)}`} className={`relative w-full max-w-11 rounded-t-sm ${index === revenue.length - 1 ? "bg-purple" : "bg-[#d6cce3]"}`} style={{ height: `${point.value / ceiling * 100}%` }}><span className="sr-only">{dateLabel(point.date)}: {formatINR(point.value)}</span></div></div>
            <span aria-hidden="true" className="relative h-7">{(period === 7 || index % 5 === 0 || index === revenue.length - 1) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-neutral-400 sm:text-[9px]">{dateLabel(point.date)}</span>}</span>
          </div>)}
        </div>
      </div>
      {total === 0 && <p className="mt-4 text-xs text-neutral-400">No confirmed payments in this period.</p>}
    </>}
  </section>;
}
