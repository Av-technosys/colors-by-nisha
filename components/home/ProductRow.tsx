"use client";

import { ProductCard, type ProductActions } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PreviewVideo } from "@/components/ui/PreviewVideo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { videoPosters, videos, type Product } from "@/data/home";
import { useRef } from "react";

interface ProductRowProps extends ProductActions {
  title: string;
  items: Product[];
  id?: string;
  video?: number;
  onPlay?: (id: number) => void;
  onShop?: () => void;
}

export function ProductRow({ title, items, id, video, onPlay, onShop, ...productActions }: ProductRowProps) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => {
    if (rail.current) rail.current.scrollBy({ left: direction * rail.current.clientWidth, behavior: "smooth" });
  };

  return <Reveal>
    <section id={id} className="mx-auto w-full max-w-[1328px] px-5 py-10 md:py-14 lg:px-6">
      <SectionHeading>{title}</SectionHeading>
      <div className="flex items-start gap-4 lg:gap-5">
        {video && <button className="group relative block aspect-9/16 w-[calc((100%_-_16px)/2)] shrink-0 overflow-hidden rounded-md bg-neutral-100 md:w-1/4" onClick={() => onPlay?.(video)} aria-label={`Play ${title} video`}>
          <PreviewVideo src={videos[video]} poster={videoPosters[video]} />
        </button>}
        <div className="group/rail relative min-w-0 flex-1">
          <div ref={rail} className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] lg:gap-5">
            {items.map(product => <ProductCard key={product.name} product={product} featured={!!video} {...productActions} />)}
          </div>
          {[-1, 1].map(direction => <button key={direction} className={`absolute top-2/5 hidden size-11 place-items-center rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 md:grid ${direction < 0 ? "-left-4" : "-right-4"}`} aria-label={`${direction < 0 ? "Previous" : "Next"} ${title} products`} onClick={() => scroll(direction)}>
            <Icon name="arrow" style={direction < 0 ? { transform: "rotate(180deg)" } : undefined} />
          </button>)}
          {video && <div className="mt-8 flex justify-center"><Button variant="hero" onClick={onShop}>View All</Button></div>}
        </div>
      </div>
    </section>
  </Reveal>;
}
