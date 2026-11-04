"use client";

import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function SaleSection({ onShop }: { onShop: () => void }) {
  return (
    <Reveal>
      <section className="relative min-h-[280px] text-white md:aspect-2/1 md:min-h-0">
        <Photo id={64} alt="Festive wardrobe collection" />
        <div className="absolute inset-x-0 top-6 mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full md:top-[22%]">
          <p className="mb-2 font-display text-xs md:mb-4 md:text-sm">Exclusive Deals</p>
          <SectionHeading align="left">Discover Festive<br />Wardrobe Now on Sale</SectionHeading>
          <Button variant="outline" onClick={onShop}>Don&apos;t Miss Out</Button>
        </div>
      </section>
    </Reveal>
  );
}
