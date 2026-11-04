import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "dark" | "light" | "outline" | "hero";
};

export function Button({ variant = "dark", className = "", ...props }: ButtonProps) {
  const colors = {
    hero: "min-w-40 rounded-md border border-[#c4a36a] bg-purple uppercase tracking-[0.12em] text-white hover:bg-[#3b315f]",
    dark: "bg-ink text-white hover:bg-neutral-800",
    light: "bg-white text-ink hover:bg-neutral-100",
    outline: "border border-current bg-transparent text-white hover:bg-white hover:text-ink",
  };

  return <button className={`inline-flex min-h-10 items-center justify-center px-5 py-2 font-display text-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none md:min-h-12 md:px-8 md:py-3 md:text-sm ${colors[variant]} ${className}`} {...props} />;
}
