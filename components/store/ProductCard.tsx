"use client";

import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { money, type Product } from "@/data/home";

export interface ProductActions {
  saved: string[];
  toggleSave: (name: string) => void;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, saved, toggleSave, onSelect, featured = false, duplicate = false }: ProductActions & { product: Product; featured?: boolean; duplicate?: boolean }) {
  const isSaved = saved.includes(product.name);

  return (
    <article aria-hidden={duplicate || undefined} className={`min-w-0 shrink-0 snap-start text-center ${featured ? "basis-full md:basis-[calc((100%_-_32px)/3)] lg:basis-[calc((100%_-_40px)/3)]" : "basis-[calc((100%_-_16px)/2)] md:basis-[calc((100%_-_32px)/3)] lg:basis-[calc((100%_-_60px)/4)]"}`}>
      <div className="group relative aspect-2/3 overflow-hidden rounded-md bg-neutral-100">
        <button tabIndex={duplicate ? -1 : undefined} className="absolute inset-0 size-full" onClick={() => onSelect(product)} aria-label={`View ${product.name}`}>
          <Photo id={product.image} alt={product.name} className="transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none" />
          {product.second && <Photo id={product.second} alt={`${product.name}, alternate view`} className="opacity-0 transition duration-500 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none group-hover:opacity-100" />}
        </button>
        <button tabIndex={duplicate ? -1 : undefined} className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white transition-transform hover:-translate-y-0.5 md:right-2.5 md:top-2.5 md:size-9 ${isSaved ? "text-[#b14d4d] [&_svg]:fill-current" : "text-ink"}`} onClick={() => toggleSave(product.name)} aria-label={`${isSaved ? "Remove" : "Add"} ${product.name} ${isSaved ? "from" : "to"} wishlist`} aria-pressed={isSaved}>
          <Icon name="heart" size={19} />
        </button>
        <button tabIndex={duplicate ? -1 : undefined} className="absolute inset-x-4 bottom-4 hidden translate-y-2 bg-white p-2.5 font-display text-sm opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:block" onClick={() => onSelect(product)}>Quick view</button>
      </div>
      <button tabIndex={duplicate ? -1 : undefined} className="mt-3 font-display text-sm leading-snug md:mt-4 md:text-base" onClick={() => onSelect(product)}>{product.name}</button>
      <p className="mt-1 text-xs text-neutral-700 md:text-sm">{money(product.price)}</p>
    </article>
  );
}
