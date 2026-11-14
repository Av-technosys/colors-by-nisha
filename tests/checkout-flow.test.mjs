import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { TextDecoder } from "node:util";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { validPaymentSignature } from "../helpers/payments/signature.ts";
import { safeReturnPath } from "../helpers/auth/return-path.ts";
import { findProductOption } from "../helpers/store/product-option.ts";

const require = createRequire(import.meta.url);
const cart = [{ id: "piece-M", slug: "test-piece", name: "Silk ensemble", size: "M", quantity: 2, price: 1250, image: "/product-placeholder.svg" }];
function compile(file, dependencies, globals = {}) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const exports = {};
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(output, { exports, Response, Request, URL, require: name => name in dependencies ? dependencies[name] : name === "@/helpers/errors" ? publicErrors : name === "@/helpers/security/requests" ? security : require(name), ...globals });
  return exports;
}

const publicErrors = compile("helpers/errors.ts", {});
const security = compile("helpers/security/requests.ts", { "server-only": {} }, { TextDecoder });

test("request protection rejects cross-origin writes and oversized UTF-8 bodies", async () => {
  const make = (body, headers = {}) => new Request("https://shop.test/api/orders", { method: "POST", headers: { "content-type": "application/json", ...headers }, body });
  assert.equal((await security.readJson(make('{"quantity":1}', { origin: "https://shop.test", "sec-fetch-site": "same-origin" }))).quantity, 1);
  for (const headers of [{ origin: "https://attacker.test" }, { "sec-fetch-site": "cross-site" }, { "sec-fetch-site": "same-site" }, { referer: "https://attacker.test/form" }]) {
    await assert.rejects(security.readJson(make("{}", headers)), error => error.status === 403);
  }
  await assert.rejects(security.readJson(make("{}", { "content-type": "text/plain" })), error => error.status === 415);
  await assert.rejects(security.readJson(make("[")), error => error.status === 400);
  await assert.rejects(security.readJson(make("[]")), error => error.status === 400);
  await assert.rejects(security.readText(make("é".repeat(100)), 150), error => error.status === 413);
  await assert.rejects(security.readText(make("{}", { "content-length": "999999" }), 100), error => error.status === 413);
});

test("request throttling is bounded and allows requests again after expiry", () => {
  let clock = 1000;
  const limited = compile("helpers/security/requests.ts", { "server-only": {} }, { Date: { now: () => clock } });
  limited.rateLimit("test", 2, 1000);
  limited.rateLimit("test", 2, 1000);
  assert.throws(() => limited.rateLimit("test", 2, 1000), error => error.status === 429 && error.retryAfter === 1);
  clock += 1001;
  assert.doesNotThrow(() => limited.rateLimit("test", 2, 1000));
});

test("unexpected database and provider messages never become visible UI errors", () => {
  const { actionError } = compile("helpers/admin/validation.ts", {}, { console: { error() {} } });
  assert.doesNotMatch(actionError({ code: "XX000", cause: { detail: "private database information" } }), /private|database|XX000/);
  assert.doesNotMatch(actionError(new Error("AWS_SECRET_ACCESS_KEY is missing")), /AWS|SECRET|missing/);
  assert.equal(actionError(new publicErrors.UserFacingError("Please choose a valid image.")), "Please choose a valid image.");
  assert.equal(publicErrors.friendlyError({ longMessage: "Provider internal detail" }, "Please try again."), "Please try again.");
  assert.match(publicErrors.friendlyError({ code: "form_password_incorrect" }), /sign-in details/);
});

test("editing product details preserves stock deducted after the form was opened", () => {
  const { stockForUpdate } = compile("helpers/admin/product-input.ts", {
    "@/helpers/storage/image-limits": { MAX_PRODUCT_IMAGES: 20 }, "./validation": {},
  });
  assert.equal(stockForUpdate(4, 5, 5), 4);
  assert.equal(stockForUpdate(5, 3, 5), 3);
  assert.equal(stockForUpdate(null, null, null), null);
  assert.equal(stockForUpdate(5, null, 5), null);
  assert.throws(() => stockForUpdate(4, 3, 5), /Stock changed/);
  assert.throws(() => stockForUpdate(4, 3, undefined), /reload/);
});

test("admin media and CSV imports enforce authorization inside the handler", async () => {
  for (const file of ["app/api/admin/products/media/[id]/route.ts", "app/api/admin/blogs/[id]/image/route.ts"]) {
    const { GET } = compile(file, {
      "@/helpers/auth/access": { adminAccessError: async () => new Response(null, { status: 403 }) },
      "@/lib/db": { db: { select() { throw new Error("Unauthorized database access"); } } },
      "@/lib/db/schema": {}, "@/helpers/storage/s3": {}, "@/helpers/admin/validation": {}, "@/helpers/admin/blog-images": {},
    });
    assert.equal((await GET(new Request("https://shop.test/api/admin/image"), { params: Promise.resolve({ id: "any" }) })).status, 403);
  }
  const { uploadProductsCsv } = compile("app/admin/products/actions.ts", {
    "@/helpers/auth/access": { requireAdmin: async () => { throw new Error("Admin access required"); } },
    "@/helpers/admin/catalog": {}, "@/helpers/admin/products": {}, "next/cache": {}, "next/navigation": {},
    "@/lib/db": {}, "@/lib/db/schema": {}, "@/helpers/storage/s3": {}, "@/helpers/storage/upload-receipt": {},
    "@/helpers/admin/product-input": {}, "@/helpers/admin/validation": {}, "@/helpers/admin/slugify": {},
  });
  await assert.rejects(uploadProductsCsv({ get() { throw new Error("Unauthorized file read"); } }), /Admin access required/);
});

test("cart quotes ignore client prices and prevent mismatched options and aggregate overselling", async () => {
  const input = compile("helpers/orders/input.ts", {});
  const variantId = "3be17a50-407a-4e1e-97a0-53e77700ad20";
  const product = { id: variantId, slug: "silk-piece", name: "Silk piece", status: "active", price: "100.00", variants: [{ id: variantId, name: "M", price: "100.00", stock: 2 }], media: [] };
  let writes = 0;
  const db = { query: { products: { findMany: async () => [product] }, orders: { findFirst: async () => null } }, transaction() { writes++; throw new Error("Unexpected write"); } };
  const { quoteCart, placeOrder } = compile("helpers/orders/service.ts", {
    "server-only": {}, "next/cache": {}, "@/lib/db": { db },
    "@/lib/db/schema": { products: {}, productMedia: {}, orders: {} },
    "@/helpers/storage/s3": {}, "@/helpers/store/product-option": { findProductOption }, "./input": input,
  });
  const line = { slug: product.slug, variantId, size: "M", quantity: 1, price: "0.01" };
  assert.equal((await quoteCart([line])).subtotal, "100.00");
  assert.equal((await quoteCart([{ ...line, size: "A different expensive option" }])).items[0].size, "M");
  await assert.rejects(placeOrder(variantId, { id: variantId, acceptedTerms: true, expectedSubtotal: "0.01", items: [line] }, {}), /Prices have changed/);
  await assert.rejects(quoteCart([{ ...line, quantity: 2 }, { ...line, size: "L" }]), /Not enough stock/);
  await assert.rejects(quoteCart([{ ...line, variantId: "5278c1fe-e791-4533-aeec-e31bdb78421e" }]), /available option/);
  assert.equal(writes, 0);
});

test("payment ownership rejects another customer and deleted accounts", async () => {
  const input = compile("helpers/orders/input.ts", {});
  const schema = { users: { id: "id", clerkId: "clerkId", deletedAt: "deletedAt" }, orders: { id: "id", userId: "userId" } };
  const users = [{ id: "customer-a", clerkId: "clerk-a", deletedAt: null }, { id: "customer-b", clerkId: "clerk-b", deletedAt: null }];
  const order = { id: "3be17a50-407a-4e1e-97a0-53e77700ad20", userId: "customer-a" };
  const db = { select() {
    let table; let predicate;
    const query = {
      from(value) { table = value; return this; }, where(value) { predicate = value; return this; },
      rows() { return (table === schema.users ? users : [order]).filter(predicate); },
      async limit() { return this.rows(); },
    };
    return query;
  } };
  const { ownedPaymentOrder } = compile("helpers/payments/service.ts", {
    "server-only": {}, "@/lib/db": { db }, "@/lib/db/schema": schema,
    "@/helpers/razorpay": {}, "@/helpers/orders/service": {}, "@/helpers/orders/input": input,
    "drizzle-orm": {
      eq: (field, value) => row => row[field] === value, isNull: field => row => row[field] === null,
      and: (...predicates) => row => predicates.every(predicate => predicate(row)),
      inArray: (field, query) => row => query.rows().some(value => value.id === row[field]),
    },
  });
  assert.equal((await ownedPaymentOrder(order.id, "clerk-a")).id, order.id);
  await assert.rejects(ownedPaymentOrder(order.id, "clerk-b"), /Order not found/);
  users[0].deletedAt = new Date();
  await assert.rejects(ownedPaymentOrder(order.id, "clerk-a"), /Order not found/);
});

test("payment startup rechecks stock before creating a gateway order", async () => {
  const input = compile("helpers/orders/input.ts", {});
  const schema = { orders: {}, payment: {}, orderItems: {}, products: {}, productVariants: {}, users: {} };
  const order = { id: "3be17a50-407a-4e1e-97a0-53e77700ad20", userId: "customer", status: "pending", totalAmount: "100.00", paidAt: null };
  let stock = 0; let gatewayCalls = 0; let writes = 0;
  const item = () => ({ productId: "product", status: "active", variantId: "variant", savedVariantId: "variant", quantity: 1, stock, hasVariants: true });
  function select() {
    let table;
    const rows = () => table === schema.orders ? [order] : table === schema.orderItems ? [item()] : [];
    return { from(value) { table = value; return this; }, where() { return this; }, leftJoin() { return this; }, orderBy() { return this; }, async for() { return rows(); }, async limit() { return rows(); }, then(resolve, reject) { return Promise.resolve(rows()).then(resolve, reject); } };
  }
  const tx = { select, insert() { return { async values() { writes++; } }; } };
  const { prepareOrderPayment } = compile("helpers/payments/service.ts", {
    "server-only": {}, "@/lib/db": { db: { select, transaction: callback => callback(tx) } }, "@/lib/db/schema": schema,
    "@/helpers/orders/service": { orderReference: () => "CBN-test" }, "@/helpers/orders/input": input,
    "@/helpers/razorpay": { razorpayKeyId: () => "public-test-key", getRazorpayClient: () => ({ orders: { async create() { gatewayCalls++; return { id: "order_test", amount: 10000, currency: "INR" }; } } }) },
  });
  await assert.rejects(prepareOrderPayment(order.id, "clerk-user"), /sold out/);
  assert.equal(gatewayCalls, 0);
  assert.equal(writes, 0);
  stock = 2;
  assert.equal((await prepareOrderPayment(order.id, "clerk-user")).razorpayOrderId, "order_test");
  assert.equal(gatewayCalls, 1);
  assert.equal(writes, 1);
});

test("replayed captured payments and repeated cancellation adjust stock only once", async () => {
  const input = compile("helpers/orders/input.ts", {});
  const now = new Date("2026-11-05T08:00:00Z");
  const schema = { orders: {}, orderItems: {}, productVariants: {}, payment: {} };
  let order = { id: "3be17a50-407a-4e1e-97a0-53e77700ad20", status: "pending", totalAmount: "100.00", paymentId: null, paidAt: null, stockDeductedAt: null, updatedAt: now };
  const item = { productId: "product", variantId: "variant", quantity: 1 };
  const variant = { id: "variant", stock: 2 };
  const attempt = { id: "attempt", paymentAmount: 10000 };
  let stockChanges = 0;
  const tx = {
    select() {
      let table;
      const rows = () => table === schema.orders ? [order] : table === schema.orderItems ? [item] : table === schema.productVariants ? [variant] : [attempt];
      return {
        from(value) { table = value; return this; }, where() { return this; }, orderBy() { return this; },
        async for() { return rows(); }, async limit() { return rows(); }, then(resolve, reject) { return Promise.resolve(rows()).then(resolve, reject); },
      };
    },
    update(table) { return { set: values => ({ where: () => {
      if (table === schema.orders) order = { ...order, ...values };
      return { async returning() { return [order]; } };
    } }) }; },
    async execute() { variant.stock += order.status === "processing" ? 1 : -1; stockChanges++; },
  };
  const { confirmOrderPayment, updateOrder } = compile("helpers/orders/service.ts", {
    "server-only": {}, "next/cache": { revalidatePath() {} }, "@/lib/db": { db: { transaction: callback => callback(tx) } },
    "@/lib/db/schema": schema, "@/helpers/storage/s3": {}, "@/helpers/store/product-option": {}, "./input": input,
  });
  const paid = { orderId: order.id, paymentId: "pay_test", paymentOrderId: "order_test", currency: "INR", amountMinor: 10000 };
  await confirmOrderPayment(paid);
  await confirmOrderPayment(paid);
  assert.equal(order.status, "processing");
  assert.equal(variant.stock, 1);
  assert.equal(stockChanges, 1);
  await assert.rejects(confirmOrderPayment({ ...paid, paymentId: "pay_other" }), /different payment/);
  await assert.rejects(confirmOrderPayment({ ...paid, amountMinor: 1 }), /amount does not match/);
  const cancelled = input.parseDelivery({ status: "cancelled", courierName: "", trackingNumber: "", trackingUrl: "", estimatedDeliveryDate: "" });
  await updateOrder(order.id, cancelled, now.toISOString());
  await updateOrder(order.id, cancelled, now.toISOString());
  assert.equal(variant.stock, 2);
  assert.equal(stockChanges, 2);
  await confirmOrderPayment(paid);
  assert.equal(variant.stock, 2);
  assert.equal(order.status, "cancelled");
});

test("collection cards point to the requested category filters", () => {
  const { CollectionSection } = compile("components/home/CollectionSection.tsx", {
    "@/components/ui/Photo": { Photo: () => null }, "@/components/ui/Reveal": { Reveal: ({ children }) => children },
    "next/link": { default: ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children) },
  });
  const html = renderToStaticMarkup(React.createElement(CollectionSection));
  assert.match(html, /href="\/shop\?category=ethnic"/);
  assert.match(html, /href="\/shop\?category=saree"/);
  assert.match(html, /href="\/shop\?category=lehenga"/);
});

test("shop category navigation updates products without remounting the page", () => {
  let url = new URL("https://shop.test/shop?page=2");
  const state = [];
  let cursor = 0;
  const filters = compile("helpers/store/shop-filters.ts", {});
  const hooks = { ...React, useMemo: callback => callback(), useEffect() {}, useRef: () => ({ current: null }),
    useState: initial => {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
  };
  const products = [
    ...Array.from({ length: 16 }, (_, index) => ({ id: `saree-${index}`, slug: `saree-${index}`, name: `Silk saree ${index + 1}`, category: "Saree", categorySlug: "saree", price: 100, inStock: true })),
    { id: "ethnic", slug: "ethnic", name: "Ethnic outfit", category: "Ethnic", categorySlug: "ethnic", price: 200, inStock: true },
    { id: "lehenga", slug: "lehenga", name: "Bridal lehenga", category: "Lehenga", categorySlug: "lehenga", price: 300, inStock: true },
  ];
  const { ShopPageContent } = compile("components/shop/ShopPageContent.tsx", {
    react: hooks, "next/navigation": { useSearchParams: () => url.searchParams },
    "@/helpers/store/shop-filters": filters, "@/data/products": { formatINR: value => `Rs ${value}` },
    "./ShopProductCard": { ShopProductCard: ({ product }) => React.createElement("span", { "data-product": product.slug }, product.name) },
    "./QuickViewModal": { QuickViewModal: () => null },
    "@/components/ui/useModalBehavior": { useModalBehavior() {} },
  }, { window: { get location() { return url; }, history: { pushState: (_state, _title, href) => { url = new URL(href, url); } }, scrollTo() {} } });
  function render() { cursor = 0; return ShopPageContent({ products }); }
  function find(node, predicate) {
    if (!node || typeof node !== "object") return;
    if (predicate(node)) return node;
    for (const child of React.Children.toArray(node.props?.children)) {
      const match = find(child, predicate);
      if (match) return match;
    }
  }
  assert.match(renderToStaticMarkup(render()), /data-product="saree-12"/);
  url = new URL("https://shop.test/shop?category=ethnic");
  let html = renderToStaticMarkup(render());
  assert.match(html, /data-product="ethnic"/);
  assert.doesNotMatch(html, /data-product="saree/);
  const categoryButton = find(render(), node => node.type === "button" && React.Children.toArray(node.props.children)[0]?.props?.children === "Saree");
  assert.ok(categoryButton);
  categoryButton.props.onClick();
  assert.equal(url.searchParams.get("category"), "saree");
  assert.equal(url.searchParams.has("page"), false);
  html = renderToStaticMarkup(render());
  assert.match(html, /data-product="saree-0"/);
  assert.doesNotMatch(html, /data-product="ethnic"/);
  url = new URL("https://shop.test/shop?category=lehenga");
  html = renderToStaticMarkup(render());
  assert.match(html, /data-product="lehenga"/);
  assert.doesNotMatch(html, /data-product="saree/);
  url = new URL("https://shop.test/shop");
  html = renderToStaticMarkup(render());
  assert.match(html, /data-product="saree-0"/);
  assert.match(html, /Showing <span[^>]*>18/);
});

test("shop filter URLs preserve unrelated filters and validate price and page values", () => {
  const { readShopFilters, shopFilterUrl } = compile("helpers/store/shop-filters.ts", {});
  const url = shopFilterUrl("https://shop.test/shop?category=saree&sort=price-descending&page=3&in_stock=1", { category: "ethnic", page: null });
  const params = new URL(url, "https://shop.test").searchParams;
  assert.equal(params.get("category"), "ethnic");
  assert.equal(params.get("sort"), "price-descending");
  assert.equal(params.get("in_stock"), "1");
  assert.equal(params.has("page"), false);
  const invalid = readShopFilters(new URLSearchParams("page=-4&min_price=-5&max_price=bad&sort=unknown"), 100);
  assert.equal(invalid.page, 1);
  assert.equal(invalid.priceRange[0], 0);
  assert.equal(invalid.priceRange[1], 100);
  assert.equal(invalid.sort, "featured");
});

test("dashboard payment history fills missing days and keeps accurate rupee values", () => {
  const { revenueDays } = compile("helpers/admin/dashboard.ts", {
    "server-only": {}, "@/lib/db": {}, "@/lib/db/schema": {}, "@/helpers/auth/access": {},
  });
  const points = revenueDays([{ date: "2026-11-04", value: "1234.50" }, { date: "2026-11-05", value: "500.25" }], "2026-11-05");
  assert.equal(points.length, 30);
  assert.equal(points[0].date, "2026-10-07");
  assert.equal(points[0].value, 0);
  assert.equal(points.at(-2).value, 1234.5);
  assert.equal(points.at(-1).value, 500.25);
  assert.equal(points.reduce((sum, point) => sum + point.value, 0), 1734.75);
});

test("dashboard builds four bounded queries and qualifies joined stock columns", async () => {
  const schema = compile("lib/db/schema.ts", {});
  const queries = [];
  const db = require("drizzle-orm/node-postgres").drizzle({
    async query(query) { queries.push(query.text); return { rows: [], fields: [] }; },
  }, { schema });
  const { getAdminDashboard } = compile("helpers/admin/dashboard.ts", {
    "server-only": {}, "@/lib/db": { db }, "@/lib/db/schema": schema,
    "@/helpers/auth/access": { requireAdmin: async () => ({}) },
  });
  const data = await getAdminDashboard();
  assert.equal(data.unavailable, false);
  assert.equal(queries.length, 4);
  assert.match(queries[0], /catalog\.id = inventory\.product_id/);
  assert.match(queries[0], /inventory\.stock <= 5/);
  assert.equal(data.revenue.length, 30);
});

test("cart feedback expires and repeated additions restart its timer", () => {
  const state = []; let cursor = 0; let items = []; let nextTimer = 0;
  const timers = new Map();
  const storage = { subscribe() {}, getSnapshot: () => items, getServerSnapshot: () => [], update: change => { items = change(items); } };
  const hooks = { ...React,
    useState: initial => { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = value; }]; },
    useRef: initial => { const index = cursor++; state[index] ??= { current: initial }; return state[index]; },
    useEffect() {}, useCallback: value => value, useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
  };
  const { StoreProvider } = compile("components/store/StoreContext.tsx", {
    react: hooks, "@/helpers/store/browser-storage": { cartStorage: storage, wishlistStorage: storage },
    "@/helpers/store/variant": { selectVariant: value => value }, "@/helpers/store/product-option": { findProductOption },
    "@/helpers/orders/input": compile("helpers/orders/input.ts", {}),
  }, { setTimeout: callback => { const id = ++nextTimer; timers.set(id, callback); return id; }, clearTimeout: id => timers.delete(id) });
  const render = () => { cursor = 0; return StoreProvider({ children: null }).props.value; };
  const product = { id: "3be17a50-407a-4e1e-97a0-53e77700ad20", slug: "silk-piece", name: "Silk piece", price: 100, inStock: true, stockCount: 5, images: [], variants: [] };
  assert.equal(render().addToCart(product), true);
  const firstTimer = nextTimer;
  assert.match(render().notification, /Added/);
  assert.equal(render().addToCart(product), true);
  assert.equal(timers.has(firstTimer), false);
  assert.equal(timers.size, 1);
  timers.get(nextTimer)();
  assert.equal(render().notification, null);
});

test("cart hydration reads saved items without writing or clearing storage", () => {
  const storage = new Map([["cbn_cart", JSON.stringify(cart)]]);
  let writes = 0;
  const { cartStorage, readSavedCart } = compile("helpers/store/browser-storage.ts", {}, { window: { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { writes++; storage.set(key, value); } }, addEventListener() {}, removeEventListener() {} } });
  assert.equal(cartStorage.getServerSnapshot().length, 0);
  assert.equal(cartStorage.getSnapshot()[0].name, "Silk ensemble");
  assert.equal(writes, 0);
  const snapshot = cartStorage.getSnapshot();
  assert.equal(snapshot, cartStorage.getSnapshot());
  cartStorage.update(items => items.map(item => ({ ...item, quantity: 3 })));
  assert.equal(JSON.parse(storage.get("cbn_cart"))[0].quantity, 3);
  assert.equal(writes, 1);
  assert.equal(readSavedCart([{ ...cart[0], price: "1250.00", size: undefined }])[0].size, "Standard");
  assert.equal(readSavedCart([null, { quantity: -1 }]).length, 0);
});

test("checkout renders cart items while account details and prices are still loading", () => {
  const skeletons = compile("components/ui/Skeleton.tsx", {});
  const link = ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children);
  const image = ({ src, alt }) => React.createElement("img", { src, alt });
  const { CheckoutContent } = compile("components/checkout/CheckoutContent.tsx", {
    "next/link": { default: link }, "next/image": { default: image },
    "next/navigation": { useRouter: () => ({ push() {} }) },
    "@/components/store/StoreContext": { useStore: () => ({ cart, cartReady: true, completeOrder() {} }) },
    "@/components/ui/Skeleton": skeletons,
    "./CheckoutAddresses": { CheckoutAddresses: () => null },
    "@/components/layout/Container": compile("components/layout/Container.tsx", {}),
    "@/components/ui/Button": { Button: ({ children, ...props }) => { delete props.variant; return React.createElement("button", props, children); } },
    "@/data/products": { formatINR: value => `Rs ${value}` },
    "@/helpers/payments/browser": { payForOrder() {} },
  });
  const html = renderToStaticMarkup(React.createElement(CheckoutContent));
  assert.match(html, /Silk ensemble/);
  assert.match(html, /Qty 2/);
  assert.match(html, /Loading form/);
  assert.match(html, /Checking current prices/);
  assert.doesNotMatch(html, /Your cart is empty/);
  assert.doesNotMatch(html, /<button[^>]*\sdisabled=""[^>]*>Proceed to Payment/);
});

test("homepage options use actual catalog variants and repair the old placeholder safely", () => {
  const variants = [
    { id: "3be17a50-407a-4e1e-97a0-53e77700ad20", name: "Female Outfit", price: "38000.00" },
    { id: "5278c1fe-e791-4533-aeec-e31bdb78421e", name: "Men's Outfit", price: "17500.00" },
  ];
  assert.equal(findProductOption(variants, "38000.00", "Free Size", "v1"), variants[0]);
  assert.equal(findProductOption(variants, 38000, "Standard"), variants[0]);
  assert.equal(findProductOption(variants, 38000, "Men's Outfit"), variants[1]);
  assert.equal(findProductOption(variants, 38000, "Female Outfit", "deleted-variant"), undefined);
  assert.equal(findProductOption(variants, 38000, "M"), undefined);
});

test("checkout address selection follows additions, edits, and removal without refetching", async () => {
  const first = { id: "first", fullName: "Nisha", country: "India", address: "12 Garden Road", apartment: "", city: "Jaipur", state: "Rajasthan", pinCode: "302001", phone: "+919876543210", isDefault: true };
  const second = { ...first, id: "second", address: "18 Lake Road", isDefault: false };
  let account = { fullName: "Nisha", email: "nisha@example.com", mobile: first.phone, addresses: [first, second] };
  let selectedId = first.id;
  let nextAccount;
  const calls = [];
  const state = [];
  let cursor = 0;
  const AddressDialog = () => null;
  const Modal = () => null;
  const { CheckoutAddresses } = compile("components/checkout/CheckoutAddresses.tsx", {
    react: { ...React, useState: initial => {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    } },
    "react-dom": { createPortal: content => content },
    "@/components/account/AddressDialog": { AddressDialog },
    "@/components/ui/Modal": { Modal },
    "@/components/account/account-client": { updateAccount: async body => { calls.push(body); return nextAccount; } },
  }, { document: { body: {} } });
  function render() {
    cursor = 0;
    return CheckoutAddresses({ account, selectedId, onSelect: address => { selectedId = address?.id ?? ""; }, onAccountChange: value => { account = value; } });
  }
  function find(node, predicate) {
    if (!node || typeof node !== "object") return;
    if (predicate(node)) return node;
    for (const child of React.Children.toArray(node.props?.children)) {
      const found = find(child, predicate);
      if (found) return found;
    }
  }
  const button = (tree, label) => {
    const found = find(tree, node => node.type === "button" && React.Children.toArray(node.props.children).includes(label));
    assert.ok(found, `Missing button: ${label}`);
    return found;
  };
  button(render(), "Add new address").props.onClick();
  let dialog = find(render(), node => node.type === AddressDialog);
  assert.equal(dialog.props.indiaOnly, true);
  const added = { ...first, id: "third", address: "30 Park Road", isDefault: false };
  dialog.props.onSaved({ ...account, addresses: [...account.addresses, added] });
  assert.equal(selectedId, added.id);
  assert.equal(calls.length, 0);

  button(render(), "Manage addresses").props.onClick();
  button(render(), "Edit").props.onClick();
  dialog = find(render(), node => node.type === AddressDialog);
  const edited = { ...first, address: "Updated Garden Road" };
  dialog.props.onSaved({ ...account, addresses: [edited, second, added] });
  assert.equal(selectedId, first.id);
  assert.equal(account.addresses[0].address, edited.address);

  button(render(), "Manage addresses").props.onClick();
  button(render(), "Remove").props.onClick();
  nextAccount = { ...account, addresses: [{ ...second, isDefault: true }, added] };
  await button(render(), "Remove address").props.onClick();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "delete-address");
  assert.equal(calls[0].id, first.id);
  assert.equal(selectedId, second.id);
});

test("admin delivery completion requires payment, stock, tracking, and a current revision", async () => {
  const input = compile("helpers/orders/input.ts", {});
  const now = new Date("2026-11-05T08:00:00Z");
  let order = { id: "3be17a50-407a-4e1e-97a0-53e77700ad20", status: "processing", paidAt: now, stockDeductedAt: now, shippedAt: null, deliveredAt: null, updatedAt: now };
  let updates = 0;
  let stockUpdates = 0;
  const tx = {
    select() { return { from: () => ({ where: () => ({ for: async () => [order] }) }) }; },
    update(table) {
      if (table !== "orders") stockUpdates++;
      return { set: values => ({ where: () => ({ returning: async () => { updates++; order = { ...order, ...values }; return [order]; } }) }) };
    },
  };
  const { updateOrder } = compile("helpers/orders/service.ts", {
    "server-only": {}, "next/cache": { revalidatePath() {} },
    "@/lib/db": { db: { transaction: callback => callback(tx) } },
    "@/lib/db/schema": { orders: "orders" },
    "@/helpers/storage/s3": {},
    "@/helpers/store/product-option": { findProductOption },
    "./input": input,
  });
  const values = input.parseDelivery({ status: "delivered", courierName: "Courier", trackingNumber: "TRACK123", trackingUrl: "", estimatedDeliveryDate: "" });
  const revision = now.toISOString();
  const complete = await updateOrder(order.id, values, revision);
  assert.equal(complete.status, "delivered");
  assert.ok(complete.shippedAt);
  assert.ok(complete.deliveredAt);
  assert.equal(complete.stockDeductedAt, now);
  assert.equal(stockUpdates, 0);
  assert.equal(updates, 1);

  order = { ...order, status: "processing", paidAt: null };
  await assert.rejects(updateOrder(order.id, values, revision), /Confirm payment and allocate stock/);
  order = { ...order, paidAt: now, stockDeductedAt: null };
  await assert.rejects(updateOrder(order.id, values, revision), /Confirm payment and allocate stock/);
  order = { ...order, stockDeductedAt: now };
  await assert.rejects(updateOrder(order.id, { ...values, trackingNumber: null }, revision), /courier and tracking number/);
  await assert.rejects(updateOrder(order.id, values, "stale-revision"), /updated elsewhere/);
  order = { ...order, status: "cancelled" };
  await assert.rejects(updateOrder(order.id, values, revision), /not allowed/);
  assert.equal(updates, 1);
});

test("payment signatures reject wrong orders, tampering, and malformed lengths", () => {
  const secret = "test-secret";
  const message = "order_test|pay_test";
  const signature = createHmac("sha256", secret).update(message).digest("hex");
  assert.equal(validPaymentSignature(message, signature, secret), true);
  assert.equal(validPaymentSignature("order_other|pay_test", signature, secret), false);
  for (const value of ["", "a", "x".repeat(64), signature + "00"]) assert.equal(validPaymentSignature(message, value, secret), false);
  assert.equal(validPaymentSignature(message, signature, undefined), false);
});

test("checkout sign-in return paths stay local and reject authentication loops", () => {
  assert.equal(safeReturnPath("/checkout"), "/checkout");
  assert.equal(safeReturnPath("/orders/123?payment=pending"), "/orders/123?payment=pending");
  for (const value of ["https://example.com", "//example.com", "/\\example.com", "/login", "/%2fexample.com"]) assert.equal(safeReturnPath(value), "/dashboard");
});

test("payment verification requires a saved gateway binding and captured provider amounts", async () => {
  const secret = "verification-test-secret";
  const signature = createHmac("sha256", secret).update("order_test|pay_test").digest("hex");
  let bound = true;
  let captures = 0;
  let fetches = 0;
  let provider = { id: "pay_test", order_id: "order_test", amount: 10000, currency: "INR", status: "captured" };
  class InputError extends Error {}
  const query = { from() { return this; }, where() { return this; }, async limit() { return bound ? [{ paymentOrderId: "order_test", paymentAmount: 10000 }] : []; } };
  const { POST } = compile("app/api/payment/razorpay/verify/route.ts", {
    "@clerk/nextjs/server": { auth: async () => ({ userId: "customer_one" }) },
    "@/lib/db": { db: { select: () => query } },
    "@/lib/db/schema": { payment: { orderId: "order_id", paymentOrderId: "payment_order_id" } },
    "@/helpers/razorpay": {
      verifyRazorpaySignature: input => validPaymentSignature(`${input.orderId}|${input.paymentId}`, input.signature, secret),
      getRazorpayClient: () => ({ payments: { fetch: async () => { fetches++; return provider; } } }),
    },
    "@/helpers/payments/service": {
      ownedPaymentOrder: async (_id, customer) => { assert.equal(customer, "customer_one"); },
      settleGatewayPayment: async entity => { captures++; assert.equal(entity.amount, 10000); return { order: { status: "processing" }, requiresAttention: false }; },
    },
    "@/helpers/orders/input": { OrderInputError: InputError },
    "@/helpers/orders/http": { readOrderRequest: request => request.json(), orderError: error => Response.json({ error: error.message }, { status: 400 }) },
  });
  const request = () => new Request("https://shop.test/api/payment/razorpay/verify", { method: "POST", body: JSON.stringify({ orderId: "merchant-order", razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: signature, amount: 1 }) });
  bound = false;
  assert.equal((await POST(request())).status, 400);
  assert.equal(fetches, 0);
  bound = true;
  provider = { ...provider, status: "authorized" };
  assert.equal((await POST(request())).status, 202);
  assert.equal(captures, 0);
  provider = { ...provider, status: "captured", amount: 1 };
  assert.equal((await POST(request())).status, 400);
  assert.equal(captures, 0);
  provider = { ...provider, amount: 10000 };
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).paid, true);
  assert.equal(captures, 1);
});

test("closing the gateway during confirmation does not cancel a successful payment", async () => {
  const calls = [];
  class Gateway {
    constructor(options) { this.options = options; }
    open() {
      this.options.handler({ razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: "signed" });
      this.options.modal.ondismiss();
    }
  }
  const { payForOrder } = compile("helpers/payments/browser.ts", {}, {
    window: { Razorpay: Gateway },
    fetch: async (url, request) => {
      calls.push({ url, body: JSON.parse(request.body) });
      return Response.json(url.endsWith("/verify") ? { paid: true } : { keyId: "test_key", amount: 10000, currency: "INR", razorpayOrderId: "order_test", orderReference: "CBN-test", customer: { name: "Customer", phone: "+919876543210" } });
    },
  });
  assert.equal((await payForOrder("merchant-order")).paid, true);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].body.orderId, "merchant-order");
});

test("gateway cancellation is recoverable and delayed confirmation stays pending", async () => {
  const prepared = { keyId: "test_key", amount: 10000, currency: "INR", razorpayOrderId: "order_test", customer: { name: "Customer", phone: "" } };
  class CancelledGateway {
    constructor(options) { this.options = options; }
    open() { this.options.modal.ondismiss(); }
  }
  const cancelled = compile("helpers/payments/browser.ts", {}, { window: { Razorpay: CancelledGateway }, fetch: async () => Response.json(prepared) });
  await assert.rejects(cancelled.payForOrder("merchant-order"), /cancelled/);
  class ConfirmingGateway {
    constructor(options) { this.options = options; }
    open() { this.options.handler({ razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: "signed" }); }
  }
  const delayed = compile("helpers/payments/browser.ts", {}, {
    window: { Razorpay: ConfirmingGateway },
    fetch: async url => { if (url.endsWith("/verify")) throw new Error("Connection lost"); return Response.json(prepared); },
  });
  const result = await delayed.payForOrder("merchant-order");
  assert.equal(result.paid, false);
  assert.equal(result.pending, true);
});
