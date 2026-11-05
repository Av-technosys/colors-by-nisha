export const orderStatuses = ["pending", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];
export class OrderInputError extends Error {}

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending", processing: "Processing", packed: "Packed", shipped: "Shipped",
  out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
};

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["processing", "cancelled"], processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"], shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"], delivered: [], cancelled: [],
};
export function nextStatuses(status: string) { return transitions[status as OrderStatus] ?? []; }
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
export function minorAmount(value: string) {
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) throw new OrderInputError("Invalid product price.");
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export function decimalAmount(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 999999999999) throw new OrderInputError("The order amount is too large.");
  return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}

export interface OrderLine { slug: string; variantId?: string; size: string; quantity: number }
export interface QuotedLine extends OrderLine {
  productId: string; name: string; price: string; imageKey: string | null; image: string; sku: string | null;
}
export interface CartQuote { items: QuotedLine[]; subtotal: string }

export function parseOrderLines(input: unknown): OrderLine[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 50) throw new OrderInputError("Your cart must contain between 1 and 50 items.");
  const lines = new Map<string, OrderLine>();
  for (const item of input) {
    if (!item || typeof item !== "object" || typeof item.slug !== "string" || !item.slug.trim() || item.slug.length > 255) throw new OrderInputError("Invalid cart item. Please review your cart.");
    if (item.variantId !== undefined && !isUuid(item.variantId)) throw new OrderInputError("Invalid product option. Please add this item again.");
    if (typeof item.size !== "string" || item.size.length > 100) throw new OrderInputError("Invalid product size.");
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new OrderInputError("Item quantities must be between 1 and 99.");
    const line = { slug: item.slug.trim(), variantId: item.variantId, size: item.size.trim(), quantity: item.quantity };
    const key = JSON.stringify([line.slug, line.variantId, line.size]);
    const previous = lines.get(key);
    if (previous) previous.quantity += line.quantity;
    else lines.set(key, line);
    if (lines.get(key)!.quantity > 99) throw new OrderInputError("You can order up to 99 of each item.");
  }
  return [...lines.values()];
}

export function parseDelivery(input: Record<string, unknown>) {
  const status = input.status;
  if (!orderStatuses.includes(status as OrderStatus)) throw new OrderInputError("Choose a valid order status.");
  const field = (name: string, max: number) => {
    const value = input[name];
    if (typeof value !== "string" || value.length > max) throw new OrderInputError("Invalid delivery details.");
    return value.trim() || null;
  };
  const trackingUrl = field("trackingUrl", 2000);
  if (trackingUrl) {
    try { if (new URL(trackingUrl).protocol !== "https:") throw new Error(); }
    catch { throw new OrderInputError("Tracking links must be valid HTTPS URLs."); }
  }
  const date = field("estimatedDeliveryDate", 10);
  const estimatedDeliveryDate = date ? new Date(`${date}T00:00:00+05:30`) : null;
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(estimatedDeliveryDate!.getTime()) || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(estimatedDeliveryDate!) !== date)) throw new OrderInputError("Enter a valid estimated delivery date.");
  return { status: status as OrderStatus, courierName: field("courierName", 100), trackingNumber: field("trackingNumber", 100), trackingUrl, estimatedDeliveryDate };
}
