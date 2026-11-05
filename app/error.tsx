"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <ErrorState retry={retry} />;
}
