"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

export function Modal({ children, title, onClose, className = "" }: { children: ReactNode; title: string; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    ref.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const items = ref.current?.querySelectorAll<HTMLElement>('button, a[href], input, select, video[controls]');
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4 md:p-6" onClick={onClose}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`relative max-h-[85dvh] overflow-auto rounded-md bg-white outline-none md:max-h-[90dvh] ${className}`} onClick={event => event.stopPropagation()}>
      <button className="absolute right-2.5 top-2.5 z-10 grid size-9 place-items-center rounded-md bg-white" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
      {children}
    </div>
  </div>;
}
