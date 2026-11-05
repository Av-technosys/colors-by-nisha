"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function StorySection({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <Reveal>
      <section className="bg-purple py-10 text-center text-white md:py-14" id="our-story">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <p className="mb-2.5 text-sm md:text-[15px]">Fashion that celebrates individuality.</p>
          <SectionHeading>Our journey is built on creativity and heritage, shaping fashion that celebrates individuality and timeless beauty.</SectionHeading>
          <Button variant="hero" onClick={onLearnMore}>Learn More</Button>
        </div>
      </section>
    </Reveal>
  );
}
