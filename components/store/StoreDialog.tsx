"use client";

import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { videos, type Product } from "@/data/home";
import { useRouter } from "next/navigation";
import type { ProductActions } from "./ProductCard";
import { ProductDetails, type CartItem } from "./ProductDetails";
import { ProductListPanel } from "./ProductListPanel";

export type DialogState = { kind: "product"; product: Product } | { kind: "video"; id: number } | { kind: "panel"; name: string };

interface StoreDialogProps extends ProductActions {
  dialog: DialogState;
  cart: CartItem[];
  onClose: () => void;
  onPanel: (name: string) => void;
  onShop: () => void;
  onAdd: (item: CartItem) => void;
  onRemove: (index: number) => void;
}

const messages: Record<string, string> = {
  "Our story": "Our journey is built on creativity and heritage, shaping fashion that celebrates individuality and timeless beauty.",
  Account: "Account access will be available when the backend is connected.",
  Blogs: "The journal is not included in this homepage preview.",
};

export function StoreDialog({ dialog, cart, onClose, onPanel, onShop, onAdd, onRemove, ...productActions }: StoreDialogProps) {
  const router = useRouter();

  if (dialog.kind === "video") return <Modal title="Fashion video" onClose={onClose} className="w-auto max-w-full bg-ink">
    <video className="block max-h-[85dvh] max-w-full" src={videos[dialog.id]} autoPlay controls playsInline />
  </Modal>;

  if (dialog.kind === "product") return <Modal title={dialog.product.name} onClose={onClose} className="w-full max-w-[950px]">
    <ProductDetails key={dialog.product.name} product={dialog.product} saved={productActions.saved} toggleSave={productActions.toggleSave} onAdd={onAdd} />
  </Modal>;

  const panel = dialog.name;
  const navigate = (name: string) => {
    if (name === "Blogs") return onPanel("Blogs");
    onClose();
    if (name === "Shop") {
      if (onShop) {
        onShop();
        return;
      }
      router.push("/shop");
      return;
    }
    if (name === "Home") {
      router.push("/");
      return;
    }
    document.getElementById(name === "Contact" ? "footer" : "our-story")?.scrollIntoView({ behavior: "smooth" });
  };

  return <Modal title={panel} onClose={onClose} className="w-full max-w-[600px] px-5 py-9 md:p-10">
    <h2 className="mb-8 font-display text-3xl leading-tight md:text-4xl">{panel}</h2>
    {panel === "Menu" ? <nav className="flex flex-col font-display">
      {["Home", "Shop", "About us", "Contact", "Blogs"].map(name => <button key={name} className="flex items-center justify-between border-b border-neutral-100 py-3.5" onClick={() => navigate(name)}>{name}<Icon name="arrow" size={16} /></button>)}
    </nav> : ["Search", "Wishlist", "Shopping bag"].includes(panel) ? <ProductListPanel key={panel} panel={panel} cart={cart} onRemove={onRemove} {...productActions} /> : <p>{messages[panel] || "This page is not included in the static homepage preview. Contact colorbynishavijay@gmail.com for more information."}</p>}
  </Modal>;
}
