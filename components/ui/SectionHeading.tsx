import type { ReactNode } from "react";

export function SectionHeading({ children, align = "center" }: { children: ReactNode; align?: "left" | "center" }) {
  return <h2 className={`pb-6 font-display text-3xl leading-tight md:pb-8 md:text-4xl ${align === "left" ? "text-left" : "text-center"}`}>{children}</h2>;
}
