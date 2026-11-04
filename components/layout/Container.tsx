import type { ComponentProps } from "react";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full ${className}`} {...props} />;
}
