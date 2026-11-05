"use client";

import { UserFacingError, friendlyError } from "@/helpers/errors";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductItem } from "@/data/products";
import { Modal } from "@/components/ui/Modal";
import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { QuickViewModal } from "./QuickViewModal";

export function ProductQuickView({ identifier, onClose }: { identifier: string; onClose: () => void }) {
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(identifier)}`, { signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new UserFacingError(result.error || "Product options could not be loaded.");
      if (!controller.signal.aborted) setProduct(result.product);
    }).catch(reason => { if (!controller.signal.aborted) setError(friendlyError(reason, "Product options could not be loaded.")); });
    return () => controller.abort();
  }, [identifier, retry]);
  if (product) return <QuickViewModal key={product.id} product={product} onClose={onClose} />;
  return <Modal title="Product options" onClose={onClose} className="w-full max-w-[960px] p-5 md:p-7">
    {error ? <div className="space-y-5 py-10 text-center"><h2 className="font-display text-2xl">Product unavailable</h2><p role="alert" className="text-sm text-neutral-500">{error}</p><div className="flex flex-wrap items-center justify-center gap-4"><Button variant="hero" onClick={() => { setError(""); setRetry(value => value + 1); }}>Try again</Button><Link href="/shop" onClick={onClose} className="text-sm text-purple underline">Browse available products</Link></div></div> : <div className="grid items-start gap-6 md:grid-cols-2"><Skeleton className="aspect-[2/3] w-full" /><FormSkeleton fields={4} /></div>}
  </Modal>;
}
