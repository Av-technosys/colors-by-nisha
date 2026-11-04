"use client";

import { Photo } from "@/components/ui/Photo";
import { PreviewVideo } from "@/components/ui/PreviewVideo";
import { Reveal } from "@/components/ui/Reveal";
import { money, handpicked, videoPosters, videos, type Product } from "@/data/home";

export function HandpickedSection({ onPlay, onSelect }: { onPlay: (id: number) => void; onSelect: (product: Product) => void }) {
  return (
    <Reveal>
      <section className="bg-ice py-10 md:py-14">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full">
          <h2 className="pb-6 md:pb-8 text-center font-display text-2xl font-medium leading-tight tracking-normal md:text-3xl">Handpicked Elegance</h2>
          <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-2 lg:grid-cols-4">
            {handpicked.map(item => (
              <article key={item.name} className="relative aspect-9/16 min-w-0 basis-[72%] shrink-0 snap-start overflow-hidden rounded-md bg-neutral-200">
                <button className="group absolute inset-0 size-full" onClick={() => onPlay(item.video)} aria-label={`Play ${item.name}`}>
                  <PreviewVideo src={videos[item.video]} poster={videoPosters[item.video]} />
                </button>
                <button className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2.5 rounded-md bg-white/25 p-2 text-left text-white backdrop-blur-md transition-colors hover:bg-white/35 md:inset-x-[15px] md:bottom-[15px] md:p-2.5" onClick={() => onSelect(item)}>
                  <span className="relative h-[60px] w-10 shrink-0 overflow-hidden rounded-md md:h-[75px] md:w-[50px]">
                    <Photo id={item.image} alt={item.name} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-xs font-medium leading-5 md:text-sm">{item.name}</span>
                    <span className="mt-1 block text-xs font-medium leading-5 md:text-sm">{money(item.price)}</span>
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
