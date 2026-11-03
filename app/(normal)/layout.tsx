import { Suspense } from "react";
import { ConditionalHeader, ConditionalFooter } from "@/components/layout/ConditionalNav";

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
    </>
  );
}
