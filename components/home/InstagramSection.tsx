"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { PreviewVideo } from "@/components/ui/PreviewVideo";
import { Reveal } from "@/components/ui/Reveal";
import { videoPosters,videos } from "@/data/home";

export function InstagramSection({ onPlay }: { onPlay: (id: number) => void }) {
  return (
    <Reveal>
      <section className="overflow-hidden bg-ice py-10 text-center md:py-14">
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-6">
          <SectionHeading>@colorsbynisha</SectionHeading>
          <div className="mb-6 flex gap-4 overflow-x-auto [scrollbar-width:none] md:mb-8 lg:gap-5">{[69,70,71,72,73,74].map(id => <button className="group relative aspect-square basis-[44%] shrink-0 overflow-hidden rounded-md bg-neutral-200 md:basis-[calc((100%_-_80px)/6)] lg:basis-[calc((100%_-_100px)/6)]" key={id} onClick={() => onPlay(id)} aria-label="Play Colors by Nisha fashion reel">
            <PreviewVideo src={videos[id]} poster={videoPosters[id]} />
          </button>)}</div>
          <a className="font-display text-sm underline underline-offset-6" href="https://www.instagram.com/colorsbynisha/" target="_blank" rel="noreferrer">Follow Us</a>
        </div>
      </section>
    </Reveal>
  );
}
