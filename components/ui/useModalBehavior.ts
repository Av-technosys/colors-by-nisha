"use client";

import { useEffect, useRef, type RefObject } from "react";

const openLayers: symbol[] = [];
let bodyLocks = 0;
let previousOverflow = "";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "video[controls]",
  "audio[controls]",
  "iframe",
  "object",
  "embed",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex^='-'])",
].join(",");

function focusableItems(dialog: HTMLElement) {
  return [...dialog.querySelectorAll<HTMLElement>(focusableSelector)].filter(item =>
    !item.closest("[inert], [aria-hidden='true']") &&
    !item.matches(":disabled") &&
    window.getComputedStyle(item).visibility !== "hidden" &&
    item.getClientRects().length > 0,
  );
}

export function useModalBehavior<T extends HTMLElement>(ref: RefObject<T | null>, open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const layer = Symbol("modal");
    openLayers.push(layer);
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let cleanupDialog: (() => void) | undefined;
    const attach = () => {
      const dialog = ref.current;
      if (!dialog || cleanupDialog) return;

      if (bodyLocks++ === 0) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      (focusableItems(dialog)[0] || dialog).focus({ preventScroll: true });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (openLayers.at(-1) !== layer) return;
        if (event.key === "Escape") {
          event.preventDefault();
          closeRef.current();
          return;
        }
        if (event.key !== "Tab") return;

        const items = focusableItems(dialog);
        if (!items.length) {
          event.preventDefault();
          dialog.focus({ preventScroll: true });
          return;
        }

        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      };

      const containFocus = (event: FocusEvent) => {
        if (openLayers.at(-1) !== layer || dialog.contains(event.target as Node)) return;
        (focusableItems(dialog)[0] || dialog).focus({ preventScroll: true });
      };

      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("focusin", containFocus);
      cleanupDialog = () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("focusin", containFocus);
        bodyLocks = Math.max(0, bodyLocks - 1);
        if (bodyLocks === 0) document.body.style.overflow = previousOverflow;
      };
    };
    attach();
    const observer = ref.current ? null : new MutationObserver(attach);
    observer?.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer?.disconnect();
      cleanupDialog?.();
      const index = openLayers.indexOf(layer);
      if (index >= 0) openLayers.splice(index, 1);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
