"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import type { CartItem } from "@/components/store/ProductDetails";
import { StoreDialog, type DialogState } from "@/components/store/StoreDialog";
import type { Product } from "@/data/home";
import { useCallback, useState } from "react";
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
  const [saved, setSaved] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const closeDialog = useCallback(() => setDialog(null), []);
  const openPanel = (name: string) => setDialog({ kind: "panel", name });
  const openProduct = (product: Product) => setDialog({ kind: "product", product });
  const openVideo = (id: number) => setDialog({ kind: "video", id });
  const shop = () => router.push("/shop");
  const toggleSave = (name: string) => setSaved(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  const addToCart = (item: CartItem) => {
    setCart(current => [...current, item]);
    openPanel("Shopping bag");
  };
  const productActions = { saved, toggleSave, onSelect: openProduct };

  return <>
    <a className="fixed left-3 -top-16 z-100 bg-white p-2.5 focus:top-2.5" href="#main">Skip to content</a>
    <Header onShop={shop} onPanel={openPanel} />
    <main id="main">
      <HeroBanner onShop={shop} paused={!!dialog} />
      <CollectionSection onShop={shop} />
      <SeasonalMarquee />
      <HandpickedSection onPlay={openVideo} onSelect={openProduct} />
      <CurrentlyObsessedSection {...productActions} />
      <StorySection onLearnMore={() => openPanel("Our story")} />
      <FestiveSection onShop={shop} />
      <SpotlightSection {...productActions} onPlay={openVideo} onShop={shop} />
      <InstagramSection onPlay={openVideo} />
      <MasterpiecesSection {...productActions} onPlay={openVideo} onShop={shop} />
      <TestimonialsSection onSelect={openProduct} />
      <SaleSection onShop={shop} />
    </main>
    <Footer onShop={shop} onPanel={openPanel} />
    <MobileNavigation onShop={shop} onPanel={openPanel} />
    {dialog && <StoreDialog dialog={dialog} cart={cart} onClose={closeDialog} onPanel={openPanel} onShop={shop} onAdd={addToCart} onRemove={index => setCart(current => current.filter((_, itemIndex) => itemIndex !== index))} {...productActions} />}
  </>;
}
