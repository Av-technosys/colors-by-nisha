"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { useLoopingRail } from "@/components/ui/useLoopingRail";
import { money, testimonials, type Product } from "@/data/home";

const reviews = [...testimonials.slice(-1), ...testimonials.slice(0, -1)];

export function TestimonialsSection({ onSelect }: { onSelect: (product: Product) => void }) {
  const { rail } = useLoopingRail(reviews.length);

  return (
    <Reveal>
      <section className="bg-ice py-8 md:pb-10">
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-6">
          <SectionHeading>Spotted in Colors by Nisha</SectionHeading>
          <div ref={rail} className="relative flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto [scrollbar-width:none] lg:gap-5">{[0, 1, 2].flatMap(copy => reviews.map(item => <article aria-hidden={copy !== 1 || undefined} className="flex basis-full shrink-0 snap-start flex-col overflow-hidden rounded-md bg-white sm:basis-[calc((100%_-_16px)/2)] lg:basis-[calc((100%_-_60px)/4)]" key={`${copy}-${item.name}`}>
            <div className="relative aspect-4/3 shrink-0">
              <Photo id={item.image} alt={item.name} />
            </div>
            <div className="flex min-h-[370px] min-w-0 flex-1 flex-col p-6 xl:p-[30px]">
              <div className="mb-2 text-lg leading-none text-[#ff9c05]" aria-label="5 out of 5 stars">★★★★★</div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px]">
                <h3 className="font-display font-medium">{item.name}</h3>
                <span className="italic text-neutral-500">✓ Verified Buyer</span>
              </div>
              <p className="mt-5 text-sm leading-[1.75] xl:text-[15px]">{item.text}</p>
              <button tabIndex={copy === 1 ? undefined : -1} className="mt-auto flex w-full items-center gap-3.5 pt-6 text-left font-display text-sm font-medium xl:text-[15px]" onClick={() => onSelect({ name: item.product, price: item.price, image: item.productImage })}>
                <span className="relative h-[90px] w-[60px] shrink-0 overflow-hidden rounded-md">
                  <Photo id={item.productImage} alt={item.product} />
                </span>
                <span className="leading-snug">{item.product}<span className="mt-1 block text-sm">{money(item.price)}</span></span>
              </button>
            </div>
          </article>))}</div>
        </div>
      </section>
    </Reveal>
  );
}
