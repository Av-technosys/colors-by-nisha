"use client";

import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { money, handpicked, masterpieces, products, type Product } from "@/data/home";
import { useState } from "react";
import type { ProductActions } from "./ProductCard";
import type { CartItem } from "./ProductDetails";

const allProducts = [...products, ...masterpieces, ...handpicked];

export function ProductListPanel({ panel, cart, saved, toggleSave, onSelect, onRemove }: ProductActions & { panel: string; cart: CartItem[]; onRemove: (index: number) => void }) {
  const [query, setQuery] = useState("");
  let items: (Product | CartItem)[] = [];
  let message = "";

  if (panel === "Shopping bag") {
    items = cart;
    message = cart.length ? `Subtotal: ${money(cart.reduce((sum, item) => sum + item.price, 0))}. This is a frontend preview; checkout is unavailable.` : "Your shopping bag is empty.";
  } else if (panel === "Wishlist") {
    items = allProducts.filter(product => saved.includes(product.name));
    if (!items.length) message = "Your wishlist is empty. Save your favorites with the heart icon.";
  } else {
    if (query.trim()) items = allProducts.filter(product => product.name.toLowerCase().includes(query.trim().toLowerCase()));
    message = !query.trim() ? "Discover your favorite styles." : !items.length ? "No matching products found." : "";
  }

  return <>
    {panel === "Search" && <input autoFocus className="mb-5 w-full border-b border-neutral-400 py-3" placeholder="Search products..." aria-label="Search products" value={query} onChange={event => setQuery(event.target.value)} />}
    {items.map((product, index) => <div className="flex items-center gap-3 border-b border-neutral-100 py-4 md:gap-5" key={`${product.name}-${index}`}>
      <button className="relative h-[100px] w-[70px] shrink-0" onClick={() => onSelect(product)}><Photo id={product.image} alt={product.name} /></button>
      <div className="flex-1 text-[13px]">
        <button onClick={() => onSelect(product)}>{product.name}</button>
        <p>{money(product.price)}</p>
        {"size" in product && <small>Size: {product.size}</small>}
      </div>
      {panel !== "Search" && <button className="grid size-9 place-items-center" aria-label={`Remove ${product.name}`} onClick={() => panel === "Shopping bag" ? onRemove(index) : toggleSave(product.name)}><Icon name="close" size={16} /></button>}
    </div>)}
    {message && <p className="pt-5">{message}</p>}
  </>;
}
