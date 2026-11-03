"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function StorySection({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <Reveal>
      <section className="bg-purple py-10 text-center text-white md:py-14" id="our-story">
        <div className="mx-auto max-w-[1328px] px-5 lg:px-6">
          <p className="mb-2.5 text-xs md:text-sm">Fashion that celebrates individuality.</p>
          <SectionHeading>Our journey is built on creativity and heritage, shaping fashion that celebrates individuality and timeless beauty.</SectionHeading>
          <Button variant="hero" onClick={onLearnMore}>Learn More</Button>
        </div>
      </section>
    </Reveal>
  );
}
