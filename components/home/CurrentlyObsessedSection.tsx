import type { ProductActions } from "@/components/store/ProductCard";
import { products } from "@/data/home";
import { ProductRow } from "./ProductRow";

export function CurrentlyObsessedSection(props: ProductActions) {
  return <ProductRow title="Currently Obsessed" id="currently-obsessed" items={products} {...props} />;
}
