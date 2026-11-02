"use client";

import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { money, type Product } from "@/data/home";
import { useState } from "react";
import type { ProductActions } from "./ProductCard";

export type CartItem = Product & { size: string };

export function ProductDetails({ product, saved, toggleSave, onAdd }: Omit<ProductActions, "onSelect"> & { product: Product; onAdd: (item: CartItem) => void }) {
  const [size, setSize] = useState("M");

  return <div className="md:grid md:grid-cols-2">
    <div className="relative h-[340px] md:h-auto md:min-h-[560px]"><Photo id={product.image} alt={product.name} className="object-top" /></div>
    <div className="flex flex-col items-start gap-4 p-6 md:gap-5 md:px-9 md:py-12">
      <h2 className="font-display text-[26px] leading-tight md:text-3xl">{product.name}</h2>
      <p>{money(product.price)}</p>
      <p>Size</p>
      <div className="flex flex-wrap gap-2">
        {["XS", "S", "M", "L", "XL", "XXL"].map(item => <button key={item} className={`min-w-9 border p-1.5 ${size === item ? "border-ink bg-ink text-white" : "border-neutral-300"}`} aria-pressed={size === item} onClick={() => setSize(item)}>{item}</button>)}
      </div>
      <Button onClick={() => onAdd({ ...product, size })}>Add to Cart</Button>
      <button className="font-display text-sm underline underline-offset-6" onClick={() => toggleSave(product.name)}>{saved.includes(product.name) ? "Remove from wishlist" : "Add to wishlist"}</button>
      <small className="text-[11px] text-neutral-500">Static storefront preview · No payment or checkout</small>
    </div>
  </div>;
}
