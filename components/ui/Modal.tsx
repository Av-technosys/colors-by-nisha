"use client";

import { useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";
import { Portal } from "./Portal";
import { useModalBehavior } from "./useModalBehavior";

export function Modal({ children, title, onClose, className = "" }: { children: ReactNode; title: string; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalBehavior(ref, true, onClose);

  const hasOverflow = className.includes("overflow-");

  return <Portal><div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 md:p-6" onClick={onClose}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`relative min-w-0 max-h-[calc(100dvh-2rem)] ${hasOverflow ? "" : "overflow-auto"} overscroll-contain rounded-md bg-white outline-none md:max-h-[calc(100dvh-3rem)] ${className}`} onClick={event => event.stopPropagation()}>
      <button className="absolute right-2.5 top-2.5 z-10 grid size-10 place-items-center rounded-md bg-white text-neutral-600 transition hover:bg-neutral-100 hover:text-ink" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button>
      <span id={titleId} className="sr-only">{title}</span>
      {children}
    </div>
  </div></Portal>;
}
