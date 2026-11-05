const sorts = ["featured", "title-ascending", "title-descending", "price-ascending", "price-descending", "created-descending"];

export function readShopFilters(params: Pick<URLSearchParams, "get">, maximum: number) {
  const price = (key: string, fallback: number) => {
    const value = params.get(key);
    const parsed = value === null || value.trim() === "" ? NaN : Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(maximum, parsed)) : fallback;
  };
  const minimum = price("min_price", 0);
  const maximumPrice = Math.max(minimum, price("max_price", maximum));
  const sort = params.get("sort") || "featured";
  return {
    category: params.get("category") || "all",
    search: params.get("search") || params.get("query") || params.get("q") || "",
    inStockOnly: params.get("in_stock") === "1",
    priceRange: [minimum, maximumPrice] as [number, number],
    sort: sorts.includes(sort) ? sort : "featured",
    page: Math.max(1, Math.min(10000, Number.parseInt(params.get("page") || "1", 10) || 1)),
  };
}

export function shopFilterUrl(current: string, changes: Record<string, string | null>) {
  const url = new URL(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === "") url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
