"use client";

import type { CartItem } from "@/components/store/ProductDetails";
import { StoreDialog, type DialogState } from "@/components/store/StoreDialog";
import { useStore } from "@/components/store/StoreContext";
import { ProductQuickView } from "@/components/shop/ProductQuickView";
import { type Product } from "@/data/home";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionSection } from "./CollectionSection";
import { CurrentlyObsessedSection } from "./CurrentlyObsessedSection";
import { FestiveSection } from "./FestiveSection";
import { HandpickedSection } from "./HandpickedSection";
import { HeroBanner } from "./HeroBanner";
import { InstagramSection } from "./InstagramSection";
import { MasterpiecesSection } from "./MasterpiecesSection";
import { SaleSection } from "./SaleSection";
import { SeasonalMarquee } from "./SeasonalMarquee";
import { SpotlightSection } from "./SpotlightSection";
import { StorySection } from "./StorySection";
import { TestimonialsSection } from "./TestimonialsSection";

export default function Storefront() {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<string | null>(null);
  const { cart, wishlist, toggleWishlist, removeFromCart } = useStore();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  const closeDialog = useCallback(() => setDialog(null), []);
  const openPanel = (name: string) => setDialog({ kind: "panel", name });
  const openProduct = (product: Product) => {
    setDialog(null);
    setQuickViewProduct(product.slug || product.name);
  };
  const openVideo = (id: number) => setDialog({ kind: "video", id });
  const shop = () => router.push("/shop");
  const toggleSave = (name: string) => toggleWishlist(name);
  const addToCart = (item: CartItem) => openProduct(item);
  const productActions = { saved: wishlist, toggleSave, onSelect: openProduct };

  return <>
    <main id="main">
      <HeroBanner onShop={shop} paused={!!dialog} />
      <CollectionSection />
      <SeasonalMarquee />
      <HandpickedSection onPlay={openVideo} onSelect={openProduct} />
      <CurrentlyObsessedSection {...productActions} />
      <StorySection onLearnMore={() => router.push("/about")} />
      <FestiveSection onShop={shop} />
      <SpotlightSection {...productActions} onPlay={openVideo} onShop={shop} />
      <InstagramSection onPlay={openVideo} />
      <MasterpiecesSection {...productActions} onPlay={openVideo} onShop={shop} />
      <TestimonialsSection onSelect={openProduct} />
      <SaleSection onShop={shop} />
    </main>
    {dialog && <StoreDialog dialog={dialog} cart={cart} onClose={closeDialog} onPanel={openPanel} onShop={shop} onAdd={addToCart} onRemove={removeFromCart} {...productActions} />}
    {quickViewProduct && (
      <ProductQuickView
        key={quickViewProduct}
        identifier={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    )}
  </>;
}
