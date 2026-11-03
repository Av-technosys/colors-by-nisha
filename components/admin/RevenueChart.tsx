"use client";

import { useState } from "react";

const weeklyRevenue = [
  { date: "27 Oct", value: 12 },
  { date: "28 Oct", value: 8 },
  { date: "29 Oct", value: 16 },
  { date: "30 Oct", value: 18 },
  { date: "31 Oct", value: 14 },
  { date: "01 Nov", value: 22 },
  { date: "02 Nov", value: 16 },
];

const monthlyRevenue = [
  { date: "04 Oct", value: 28 },
  { date: "09 Oct", value: 42 },
  { date: "14 Oct", value: 36 },
  { date: "19 Oct", value: 58 },
  { date: "24 Oct", value: 46 },
  { date: "29 Oct", value: 68 },
  { date: "02 Nov", value: 54 },
];

export function RevenueChart() {
  const [period, setPeriod] = useState("Last 7 days");
  const isWeek = period === "Last 7 days";
  const revenue = isWeek ? weeklyRevenue : monthlyRevenue;
  const ticks = isWeek ? [25, 20, 15, 10, 0] : [80, 60, 40, 20, 0];
  const total = revenue.reduce((sum, point) => sum + point.value * 1000, 0);

  return (
    <section className="overflow-hidden rounded-xl border border-[#e8e5df] bg-white p-5 sm:p-6" aria-label="Sample revenue chart">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg">Revenue overview</h2>
          <p className="mt-1 text-[11px] text-neutral-400">A little growth, beautifully illustrated.</p>
        </div>
        <label>
          <span className="sr-only">Revenue period</span>
          <select
            value={period}
            onChange={event => setPeriod(event.target.value)}
            className="min-h-9 w-auto rounded-lg border border-[#e5e1da] bg-white px-3 text-[10px] outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </label>
      </div>

      <div className="mb-5 mt-6 flex items-baseline gap-3">
        <span className="font-display text-3xl text-purple">₹{total.toLocaleString("en-IN")}</span>
        <span className="text-[10px] text-neutral-400">sample revenue</span>
      </div>

      <div className="flex h-48 gap-3 sm:h-56">
        <div aria-hidden="true" className="flex flex-col justify-between pb-7 text-[9px] text-neutral-400">
          {ticks.map(value => <span key={value}>₹{value ? `${value}k` : "0"}</span>)}
        </div>
        <div className="relative flex min-w-0 flex-1 gap-2 border-b border-[#ece8e1] sm:gap-4">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between">
            {ticks.map(value => <span key={value} className="border-t border-dashed border-[#eeeae4]" />)}
          </div>
          {revenue.map((point, index) => (
            <div key={point.date} className="relative flex min-w-0 flex-1 flex-col justify-end">
              <div className="flex min-h-0 flex-1 items-end justify-center pb-0">
                <div
                  title={`${point.date}: ₹${point.value},000`}
                  className={`relative w-full max-w-11 rounded-t-md ${index === 5 ? "bg-purple" : "bg-[#d6cce3]"}`}
                  style={{ height: `${point.value / ticks[0] * 100}%` }}
                >
                  <span className="sr-only">{point.date}: ₹{point.value},000</span>
                </div>
              </div>
              <span className="flex h-7 items-end justify-center whitespace-nowrap text-[8px] text-neutral-400 sm:text-[9px]">{point.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
