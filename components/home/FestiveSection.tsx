"use client";

import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";

export function FestiveSection({ onShop }: { onShop: () => void }) {
  return (
    <Reveal>
      <section className="grid md:min-h-[560px] md:grid-cols-2 lg:min-h-[680px]">
        <div className="relative aspect-4/3 md:aspect-auto">
          <Photo id={42} alt="Festive designs by Colors by Nisha" />
        </div>
        <div className="self-center px-5 py-10 md:px-10 lg:px-16">
          <p className="mb-2 text-[13px]">Festive Exclusives</p>
          <h2 className="mb-4 font-display text-3xl leading-tight md:text-4xl">A Symphony of Colors</h2>
          <p className="mb-7 max-w-[610px] text-[13px] md:text-[15px]">Celebrate your special moments with flawless craftsmanship. Discover a curated selection of vibrant styles that perfectly blend traditional artistry with modern grace.</p>
          <Button variant="hero" onClick={onShop}>Shop The Look</Button>
        </div>
      </section>
    </Reveal>
  );
}
