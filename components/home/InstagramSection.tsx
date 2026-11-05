"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { PreviewVideo } from "@/components/ui/PreviewVideo";
import { Reveal } from "@/components/ui/Reveal";
import { useLoopingRail } from "@/components/ui/useLoopingRail";
import { videoPosters, videos } from "@/data/home";

const reels = [69, 70, 71, 72, 73, 74];

export function InstagramSection({ onPlay }: { onPlay: (id: number) => void }) {
  const { rail } = useLoopingRail(reels.length);

  return (
    <Reveal>
      <section className="overflow-hidden bg-ice py-10 text-center md:py-14">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <SectionHeading>@colorsbynisha</SectionHeading>
        </div>
        <div ref={rail} className="relative mb-8 flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] md:mb-12 lg:gap-5">{[0, 1, 2].flatMap(copy => reels.map(id => <button className="group relative aspect-square basis-[75%] shrink-0 snap-start overflow-hidden rounded-md bg-neutral-200 sm:basis-[calc((100%_-_16px)/2)] lg:basis-[calc((100%_-_60px)/4)]" key={`${copy}-${id}`} onClick={() => onPlay(id)} tabIndex={copy === 1 ? undefined : -1} aria-hidden={copy !== 1 || undefined} aria-label="Play Colors by Nisha fashion reel">
            <PreviewVideo src={videos[id]} poster={videoPosters[id]} />
          </button>))}</div>
        <a className="inline-flex min-h-10 min-w-40 items-center justify-center rounded-md border border-[#c4a36a] bg-purple px-5 py-2 font-display text-xs uppercase tracking-[0.12em] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#3b315f] hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none md:min-h-12 md:px-8 md:py-3 md:text-sm" href="https://www.instagram.com/colorsbynisha/" target="_blank" rel="noreferrer">Follow Us</a>
      </section>
    </Reveal>
  );
}
