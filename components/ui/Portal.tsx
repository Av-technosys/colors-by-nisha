"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Portal({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return ready ? createPortal(children, document.body) : null;
}
