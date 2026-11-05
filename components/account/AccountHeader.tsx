import Link from "next/link";

export function AccountHeader() {
  return <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#e8e3da] pb-8 sm:flex-row sm:items-end md:mb-10"><div><p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-neutral-400">Colors by Nisha Vijay · My account</p><h1 className="font-display text-3xl md:text-4xl">Your account</h1><p className="mt-3 text-sm text-neutral-500">Your orders, delivery updates, and personal details.</p></div><Link href="/shop" className="inline-flex min-h-11 w-fit items-center rounded-md border border-[#ddd5c8] bg-white px-4 text-sm text-purple">Explore the collection →</Link></header>;
}
