"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { money, testimonials, type Product } from "@/data/home";

export function TestimonialsSection({ onSelect }: { onSelect: (product: Product) => void }) {
  return (
    <Reveal>
      <section className="bg-ice py-10 md:py-14">
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-6">
          <SectionHeading>Spotted in Colors by Nisha</SectionHeading>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] md:gap-8">{testimonials.map(item => <article className="flex basis-[90%] shrink-0 snap-start overflow-hidden rounded-md bg-white md:basis-[calc((100%_-_30px)/2)]" key={item.name}>
            <div className="relative hidden min-h-[340px] basis-[42%] shrink-0 lg:block">
              <Photo id={item.image} alt={item.name} />
            </div>
            <div className="min-w-0 flex-1 p-6">
              <div className="mb-3 tracking-[3px] text-[#ff9c05]" aria-label="5 out of 5 stars">★★★★★</div>
              <h3 className="font-display text-lg">{item.name}</h3>
              <small className="text-[11px]">✓ Verified Buyer</small>
              <p className="mb-5 mt-4 min-h-[70px] text-[13px] md:min-h-0">{item.text}</p>
              <button className="flex w-full items-center gap-3 border-t border-neutral-100 pt-4 text-left font-display text-[13px]" onClick={() => onSelect({ name: item.product, price: item.price, image: item.productImage })}>
                <span className="relative h-[65px] w-12 shrink-0">
                  <Photo id={item.productImage} alt={item.product} />
                </span>
                <div>{item.product}<small className="mt-2 block font-sans text-[11px]">{money(item.price)}</small>
                </div>
              </button>
            </div>
          </article>)}</div>
        </div>
      </section>
    </Reveal>
  );
}
