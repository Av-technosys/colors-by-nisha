import type { ProductItem } from "@/data/products";

export function selectVariant(product: ProductItem, variantId: string): ProductItem {
  const variant = product.variants?.find(item => item.id === variantId);
  if (!variant) return product;
  return {
    ...product,
    variantId: variant.id,
    price: variant.price,
    images: variant.images.length ? variant.images : product.images,
    inStock: product.inStock && (variant.stock === null || variant.stock > 0),
    stockCount: variant.stock ?? undefined,
  };
}

export function variantName(product: ProductItem) {
  return product.variants?.find(item => item.id === product.variantId)?.name || "Standard";
}
