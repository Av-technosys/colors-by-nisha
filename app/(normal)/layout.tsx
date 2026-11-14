import { Suspense } from "react";
import { ConditionalHeader, ConditionalFooter, ConditionalMobileNavigation } from "@/components/layout/ConditionalNav";

export default function NormalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="sr-only z-[200] rounded-md bg-white px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-2 focus:outline-offset-2 focus:outline-[#a66c40]">
        Skip to content
      </a>
      <Suspense fallback={null}>
        <ConditionalHeader />
      </Suspense>
      <div id="main-content" tabIndex={-1} className="outline-none">{children}</div>
      <Suspense fallback={null}>
        <ConditionalFooter />
      </Suspense>
      <Suspense fallback={null}>
        <ConditionalMobileNavigation />
      </Suspense>
    </>
  );
}
