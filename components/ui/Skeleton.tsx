export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block rounded-md bg-[#eae6df] motion-safe:animate-pulse ${className}`} />;
}

export function ItemSkeleton({ count = 2 }: { count?: number }) {
  return <div role="status" aria-label="Loading items" className="space-y-5">
    {Array.from({ length: count }, (_, index) => <div key={index} className="flex gap-4 py-3"><Skeleton className="h-24 w-16 shrink-0" /><div className="flex-1 space-y-3 pt-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-4 w-20" /></div></div>)}
  </div>;
}

export function TableSkeleton({ rows = 5, heading = true }: { rows?: number; heading?: boolean }) {
  return <div role="status" aria-label="Loading records" className="space-y-5">
    {heading && <div className="space-y-3"><Skeleton className="h-9 w-48" /><Skeleton className="h-3 w-72 max-w-full" /></div>}
    <div className="overflow-hidden rounded-md border border-[#e8e3da] bg-white"><div className="border-b border-[#eeeae4] p-5"><Skeleton className="h-10 w-64 max-w-full" /></div>{Array.from({ length: rows }, (_, index) => <div key={index} className="grid grid-cols-3 gap-5 border-b border-[#eeeae4] px-5 py-5 sm:grid-cols-4"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /><Skeleton className="hidden h-5 w-full sm:block" /></div>)}</div>
  </div>;
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return <div role="status" aria-label="Loading form" className="rounded-md border border-[#e8e3da] bg-white p-5 md:p-7"><Skeleton className="mb-6 h-7 w-44" /><div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: fields }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-12 w-full" /></div>)}</div></div>;
}
