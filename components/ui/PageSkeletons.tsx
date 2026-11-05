import { FormSkeleton, ItemSkeleton, Skeleton, TableSkeleton } from "./Skeleton";

export function PageIntro({ title }: { title: string }) {
  return <header className="py-8 text-center md:py-10"><p className="mb-2 text-xs text-neutral-400">Home · {title}</p><h1 className="font-display text-3xl md:text-4xl">{title}</h1></header>;
}

export function CollectionSkeleton({ title = "Shop", blog = false, filters = true }: { title?: string; blog?: boolean; filters?: boolean }) {
  return <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] pb-12"><PageIntro title={title} /><div className={blog || !filters ? "" : "grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]"}>
    {!blog && filters && <aside className="hidden space-y-6 lg:block"><h2 className="font-display text-lg">Filters</h2>{[0, 1, 2].map(item => <div key={item} className="space-y-3 border-t border-[#e8e3da] pt-5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-36" /></div>)}</aside>}
    <div role="status" aria-label={`Loading ${title.toLowerCase()}`} className={`grid gap-x-5 gap-y-8 ${blog ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 xl:grid-cols-3"}`}>{Array.from({ length: 6 }, (_, index) => <div key={index} className="space-y-3"><Skeleton className={blog ? "aspect-[4/3] w-full" : "aspect-[2/3] w-full"} /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>)}</div>
  </div></div>;
}

export function ProductSkeleton() {
  return <div role="status" aria-label="Loading product" className="mx-auto grid w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] gap-5 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14"><div className="flex min-w-0 gap-4"><Skeleton className="hidden w-16 shrink-0 md:block lg:w-20" /><Skeleton className="aspect-[2/3] min-w-0 flex-1" /></div><div className="space-y-6 lg:px-8"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-28" /><div className="space-y-3"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-3 w-full" /></div><FormSkeleton fields={2} /><Skeleton className="h-12 w-full" /></div></div>;
}

export function ArticleSkeleton() {
  return <div role="status" aria-label="Loading article" className="mx-auto max-w-[1100px] space-y-7 px-5 py-10"><Skeleton className="mx-auto h-9 w-2/3" /><Skeleton className="mx-auto h-3 w-44" /><Skeleton className="aspect-[16/7] w-full" /><div className="mx-auto max-w-[760px] space-y-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className={`h-3 ${index % 3 === 2 ? "w-3/4" : "w-full"}`} />)}</div></div>;
}

export function AccountSkeleton() {
  return <div role="status" aria-label="Loading account details" className="space-y-6"><TableSkeleton rows={3} heading={false} /><FormSkeleton fields={4} /><FormSkeleton fields={2} /></div>;
}

export function OrderSkeleton({ admin = false, embedded = false }: { admin?: boolean; embedded?: boolean }) {
  return <div role="status" aria-label="Loading order" className={admin || embedded ? "" : "mx-auto max-w-[1000px] px-5 py-10"}><Skeleton className="mb-6 h-8 w-48" /><div className={`grid items-start gap-6 ${admin ? "xl:grid-cols-[minmax(0,1fr)_320px]" : ""}`}><div className="rounded-md border border-[#e8e3da] bg-white p-6"><h2 className="mb-5 font-display text-xl">Order details</h2><ItemSkeleton /><div className="grid gap-6 sm:grid-cols-2"><FormSkeleton fields={2} /><FormSkeleton fields={2} /></div></div>{admin && <FormSkeleton fields={5} />}</div></div>;
}

export function AuthSkeleton() {
  return <main role="status" aria-label="Loading sign in" className="grid min-h-svh bg-[#faf9f6] lg:grid-cols-2"><div className="hidden bg-purple lg:block" /><div className="m-auto w-full max-w-md space-y-6 p-8"><Skeleton className="h-9 w-48" /><FormSkeleton fields={2} /><Skeleton className="h-12 w-full" /></div></main>;
}

export function AdminDashboardSkeleton() {
  return <div role="status" aria-label="Loading dashboard" className="space-y-7"><Skeleton className="h-9 w-64 max-w-full" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(item => <div key={item} className="space-y-5 rounded-md border border-[#e8e3da] bg-white p-5"><Skeleton className="h-3 w-28" /><Skeleton className="h-9 w-24" /><Skeleton className="h-3 w-36" /></div>)}</div><div className="grid gap-5 xl:grid-cols-[1.8fr_1fr]"><Skeleton className="h-72 w-full" /><FormSkeleton fields={4} /></div><TableSkeleton heading={false} rows={4} /></div>;
}

export function OrderListSkeleton() {
  return <div><h2 className="mb-3 font-display text-3xl md:text-4xl">Your orders</h2><p className="mb-8 text-sm text-neutral-500">Your pieces, from our atelier to your doorstep.</p><TableSkeleton heading={false} /></div>;
}
