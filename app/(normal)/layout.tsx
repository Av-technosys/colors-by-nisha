import { Suspense } from "react";
import { ConditionalHeader, ConditionalFooter, ConditionalMobileNavigation } from "@/components/layout/ConditionalNav";

export default function NormalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <ConditionalHeader />
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <ConditionalFooter />
      </Suspense>
      <Suspense fallback={null}>
        <ConditionalMobileNavigation />
      </Suspense>
    </>
  );
}
