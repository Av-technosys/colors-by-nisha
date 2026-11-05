"use client";

import Link from "next/link";
import { Button } from "./Button";

export function ErrorState({ retry }: { retry: () => void }) {
  return <main className="mx-auto flex min-h-[60dvh] w-[calc(100%-2rem)] max-w-lg flex-col items-center justify-center py-14 text-center text-ink">
    <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#94764d]">Colors by Nisha</p>
    <h1 className="font-display text-3xl">Let’s try that again</h1>
    <p className="mt-4 text-sm leading-relaxed text-neutral-500">This page is temporarily unavailable. Please try again in a moment.</p>
    <Button variant="hero" onClick={retry} className="mt-7">Try again</Button>
    <Link href="/" className="mt-5 min-h-11 content-center text-xs text-purple underline underline-offset-4">Return to home</Link>
  </main>;
}
