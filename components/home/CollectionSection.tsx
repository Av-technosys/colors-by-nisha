"use client";

import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";

export function CollectionSection({ onShop }: { onShop: () => void }) {
  return (
    <Reveal>
      <section className="mx-auto grid max-w-[1328px] grid-cols-3 gap-2.5 px-5 py-10 md:py-14 lg:px-6" aria-label="Shop by collection">{["Occasion Atelier", "Drape Elite", "Couture Royale"].map((name, i) => <button key={name} className="group relative aspect-3/4 overflow-hidden rounded-md after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:bg-linear-to-t after:from-black/20 after:to-transparent" onClick={onShop}>
        <Photo id={i + 6} alt={name} className="transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none" />
        <span className="absolute inset-x-1 bottom-4 z-10 font-display text-xs leading-snug text-white md:inset-x-2.5 md:bottom-6 md:text-[17px]">{name}</span>
      </button>)}</section>
    </Reveal>
  );
}
