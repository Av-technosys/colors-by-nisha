"use client";

import "./globals.css";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return <html lang="en"><body className="bg-white font-sans"><ErrorState retry={retry} /></body></html>;
}
