import type { CartItem } from "@/components/store/StoreContext";

export function readSavedCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (!item || typeof item.slug !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1) return [];
    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0) return [];
    const size = typeof item.size === "string" ? item.size : "Standard";
    return [{ ...item, id: item.id || `${item.slug}-${size}-${item.variantId || "default"}`, size, price, image: item.image || "/product-placeholder.svg" }];
  }).slice(0, 50);
}

function browserStorage<T>(key: string, empty: T, parse: (value: unknown) => T) {
  let snapshot = empty;
  let lastRaw: string | null | undefined;
  let storageAvailable = true;
  const listeners = new Set<() => void>();
  function getSnapshot() {
    if (typeof window === "undefined" || !storageAvailable) return snapshot;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== lastRaw) {
        lastRaw = raw;
        snapshot = raw ? parse(JSON.parse(raw)) : empty;
      }
    } catch { storageAvailable = false; }
    return snapshot;
  }
  return {
    getSnapshot,
    getServerSnapshot: () => empty,
    subscribe(listener: () => void) {
      listeners.add(listener);
      const changed = (event: StorageEvent) => { if (event.key === key || event.key === null) listener(); };
      window.addEventListener("storage", changed);
      return () => { listeners.delete(listener); window.removeEventListener("storage", changed); };
    },
    update(change: (current: T) => T) {
      snapshot = change(getSnapshot());
      lastRaw = JSON.stringify(snapshot);
      try { window.localStorage.setItem(key, lastRaw); } catch { storageAvailable = false; }
      listeners.forEach(listener => listener());
    },
  };
}

export const cartStorage = browserStorage<CartItem[]>("cbn_cart", [], readSavedCart);
export const wishlistStorage = browserStorage<string[]>("cbn_wishlist", [], value => Array.isArray(value) ? value.filter(item => typeof item === "string") : []);
