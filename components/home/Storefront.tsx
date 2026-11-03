"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import type { CartItem } from "@/components/store/ProductDetails";
import { StoreDialog, type DialogState } from "@/components/store/StoreDialog";
import { useStore } from "@/components/store/StoreContext";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { images, type Product } from "@/data/home";
import type { ProductItem } from "@/data/products";
import { useCallback, useEffect, useState } from "react";
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
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const { wishlist, toggleWishlist, addToCart: globalAddToCart, setCartOpen } = useStore();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  const closeDialog = useCallback(() => setDialog(null), []);
  const openPanel = (name: string) => setDialog({ kind: "panel", name });
  const openProduct = (product: Product) => {
    const imgSrc = images[product.image] || "/product-placeholder.svg";
    const secondSrc = product.second ? images[product.second] : undefined;
    const imgs = [imgSrc, secondSrc].filter(Boolean) as string[];
    const item: ProductItem = {
      id: String(product.name),
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: product.name,
      price: product.price,
      images: imgs.length ? imgs : ["/product-placeholder.svg"],
      category: "Couture",
      categorySlug: "couture",
      inStock: true,
      description: "Handcrafted designer heirloom created with royal heritage craftsmanship, fine fabrics, and delicate embroidery.",
      variants: [{ id: "v1", name: "Free Size", stock: 10, price: product.price, images: imgs }],
    };
    setQuickViewProduct(item);
  };
  const openVideo = (id: number) => setDialog({ kind: "video", id });
  const shop = () => document.getElementById("currently-obsessed")?.scrollIntoView({ behavior: "smooth" });
  const toggleSave = (name: string) => toggleWishlist(name);
  const addToCart = (item: CartItem) => {
    setCart(current => [...current, item]);
    const imgSrc = images[item.image] || "/product-placeholder.svg";
    globalAddToCart({
      id: String(item.name),
      name: item.name,
      slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: item.price,
      images: [imgSrc],
      category: "Couture",
      inStock: true,
      description: "",
      variants: [],
    }, item.size, 1);
    setCartOpen(true);
  };
  const productActions = { saved: wishlist, toggleSave, onSelect: openProduct };

  return <>
    <Header />
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
    <Footer />
    <MobileNavigation />
    {dialog && <StoreDialog dialog={dialog} cart={cart} onClose={closeDialog} onPanel={openPanel} onShop={shop} onAdd={addToCart} onRemove={index => setCart(current => current.filter((_, itemIndex) => itemIndex !== index))} {...productActions} />}
    {quickViewProduct && (
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    )}
  </>;
}
