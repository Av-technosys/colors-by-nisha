import type { ReactNode } from "react";

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#94764d]">{eyebrow}</p>
        <h1 className="break-words font-display text-3xl leading-tight tracking-tight sm:text-[34px]">{title}</h1>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-neutral-500 sm:text-[13px]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  status = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  let color = "bg-neutral-100 text-neutral-500";

  if (["Delivered", "Paid", "Active", "Published", "Resolved"].includes(status)) {
    color = "bg-[#edf4ed] text-[#517254]";
  } else if (["Processing", "New"].includes(status)) {
    color = "bg-[#f1edf7] text-[#76618e]";
  } else if (status === "Shipped") {
    color = "bg-[#edf2f7] text-[#5a738c]";
  } else if (["Pending", "Low stock"].includes(status)) {
    color = "bg-[#faf3e6] text-[#9c7a3f]";
  } else if (["Draft", "Inactive", "Read"].includes(status)) {
    color = "bg-[#f1f0ed] text-[#8a8477]";
  } else if (["Refunded", "Failed", "Out of stock"].includes(status)) {
    color = "bg-[#f7eeec] text-[#a16b60]";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] ${color}`}>
      <span className="size-1 rounded-md bg-current" />
      {status}
    </span>
  );
}
