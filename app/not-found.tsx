import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[65dvh] w-[calc(100%-2rem)] max-w-lg flex-col items-center justify-center py-14 text-center text-ink">
    <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#94764d]">Colors by Nisha</p>
    <h1 className="font-display text-3xl">This page has moved</h1>
    <p className="mt-4 text-sm leading-relaxed text-neutral-500">We couldn’t find what you were looking for. Explore the collection or return to the home page.</p>
    <Link href="/shop" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md border border-[#c4a36a] bg-purple px-6 font-display text-xs uppercase tracking-[0.12em] text-white">Explore the collection</Link>
    <Link href="/" className="mt-5 min-h-11 content-center text-xs text-purple underline underline-offset-4">Return to home</Link>
  </main>;
}
