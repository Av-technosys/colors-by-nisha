import type { ReactNode } from "react";

export function SectionHeading({ children, align = "center" }: { children: ReactNode; align?: "left" | "center" }) {
  return <h2 className={`pb-6 font-display text-2xl font-medium leading-tight tracking-normal md:pb-8 md:text-3xl ${align === "left" ? "text-left" : "text-center"}`}>{children}</h2>;
}
