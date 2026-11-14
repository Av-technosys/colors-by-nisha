"use client";

import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";

export function CollectionSection() {
  return (
    <Reveal>
      <section className="mx-auto grid w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] grid-cols-3 gap-2.5 py-10 md:py-14" aria-label="Shop by collection">{["Occasion Atelier", "Drape Elite", "Couture Royale"].map((name, i) => <Link key={name} href={`/shop?category=${["ethnic", "saree", "lehenga"][i]}`} className="group relative aspect-3/4 overflow-hidden rounded-md after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:bg-linear-to-t after:from-black/20 after:to-transparent">
        <Photo id={i + 6} alt={name} className="transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none" />
        <span className="absolute inset-x-1 bottom-4 z-10 flex min-h-10 items-end justify-center px-1 text-center font-display text-xs leading-snug text-white md:inset-x-2.5 md:bottom-6 md:min-h-12 md:px-2 md:text-[17px]">{name}</span>
      </Link>)}</section>
    </Reveal>
  );
}
