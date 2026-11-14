"use client";

import { ProductCard, type ProductActions } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PreviewVideo } from "@/components/ui/PreviewVideo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { videoPosters, videos, type Product } from "@/data/home";
import { useLoopingRail } from "@/components/ui/useLoopingRail";

interface ProductRowProps extends ProductActions {
  title: string;
  items: Product[];
  id?: string;
  video?: number;
  videoOnRight?: boolean;
  onPlay?: (id: number) => void;
  onShop?: () => void;
}

export function ProductRow({ title, items, id, video, videoOnRight = false, onPlay, onShop, ...productActions }: ProductRowProps) {
  const { rail, scroll, autoplayPaused, toggleAutoplay } = useLoopingRail(items.length, !!video);

  return <Reveal>
    <section id={id} className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] py-10 md:py-14">
      <SectionHeading>{title}</SectionHeading>
      <div className={`flex items-start gap-4 lg:gap-5 ${videoOnRight ? "flex-row-reverse" : ""}`}>
        {video && <button className="group relative block aspect-9/16 w-[calc((100%_-_16px)/2)] shrink-0 overflow-hidden rounded-md bg-neutral-100 md:w-1/4" onClick={() => onPlay?.(video)} aria-label={`Play ${title} video`}>
          <PreviewVideo src={videos[video]} poster={videoPosters[video]} />
        </button>}
        <div className="group/rail relative min-w-0 flex-1">
          <div ref={rail} className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] lg:gap-5">
            {(video ? [0, 1, 2] : [1]).flatMap(copy => items.map(product => <ProductCard key={`${copy}-${product.name}`} product={product} featured={!!video} duplicate={copy !== 1} {...productActions} />))}
          </div>
          {video && <button type="button" onClick={toggleAutoplay} aria-pressed={autoplayPaused} className="mt-3 min-h-9 rounded-md border border-neutral-300 bg-white px-3 text-xs text-neutral-700 transition hover:border-ink hover:text-ink">
            {autoplayPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
          </button>}
          {[-1, 1].map(direction => <button key={direction} className={`absolute top-2/5 hidden size-11 place-items-center rounded-md bg-white opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 md:grid ${direction < 0 ? "-left-4" : "-right-4"}`} aria-label={`${direction < 0 ? "Previous" : "Next"} ${title} products`} onClick={() => scroll(direction)}>
            <Icon name="arrow" style={direction < 0 ? { transform: "rotate(180deg)" } : undefined} />
          </button>)}
          {video && <div className="mt-8 flex justify-center"><Button variant="hero" onClick={onShop}>View All</Button></div>}
        </div>
      </div>
    </section>
  </Reveal>;
}
