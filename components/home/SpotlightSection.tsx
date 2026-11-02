import type { ProductActions } from "@/components/store/ProductCard";
import { products } from "@/data/home";
import { ProductRow } from "./ProductRow";

export function SpotlightSection(props: ProductActions & { onPlay: (id: number) => void; onShop: () => void }) {
  return <ProductRow title="In the Spotlight" items={products} video={43} {...props} />;
}
