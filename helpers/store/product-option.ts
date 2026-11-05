export function findProductOption<T extends { id: string; name: string; price: number | string }>(variants: T[], basePrice: number | string, size: string, variantId?: string) {
  if (variantId && variantId !== "v1") return variants.find(item => item.id === variantId);
  const named = variants.find(item => item.name.toLowerCase() === size.toLowerCase());
  if (named) return named;
  if (variants.length === 1) return variants[0];
  if (!size || ["standard", "free size"].includes(size.toLowerCase()) || variantId === "v1") {
    const standard = variants.filter(item => ["standard", "default title"].includes(item.name.toLowerCase()) && Number(item.price) === Number(basePrice));
    if (standard.length === 1) return standard[0];
    const defaults = variants.filter(item => Number(item.price) === Number(basePrice));
    if (defaults.length === 1) return defaults[0];
  }
  return undefined;
}
