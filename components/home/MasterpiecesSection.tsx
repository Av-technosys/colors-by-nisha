import type { ProductActions } from "@/components/store/ProductCard";
import { masterpieces } from "@/data/home";
import { ProductRow } from "./ProductRow";

export function MasterpiecesSection(props: ProductActions & { onPlay: (id: number) => void; onShop: () => void }) {
  return <ProductRow title="Our Masterpieces" items={masterpieces} video={53} videoOnRight {...props} />;
}
