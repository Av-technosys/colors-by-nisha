"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-md border border-[#e8e5df] bg-white p-8">
      <h1 className="font-display text-2xl">This page couldn’t be loaded.</h1>
      <p className="mt-3 text-sm text-neutral-500">Check your database connection and that the required migrations have been applied, then try again.</p>
      <button onClick={reset} className="mt-6 min-h-11 rounded-md bg-purple px-5 text-sm text-white">Try again</button>
    </div>
  );
}
