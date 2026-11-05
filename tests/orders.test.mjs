import assert from "node:assert/strict";
import test from "node:test";
import { decimalAmount, minorAmount, nextStatuses, parseDelivery, parseOrderLines } from "../helpers/orders/input.ts";

const variantId = "3be17a50-407a-4e1e-97a0-53e77700ad20";
const line = { slug: "silk-lehenga", variantId, size: "M", quantity: 1 };
const delivery = { status: "processing", courierName: "", trackingNumber: "", trackingUrl: "", estimatedDeliveryDate: "" };

test("amount calculations preserve decimal prices without floating point rounding", () => {
  assert.equal(minorAmount("1299.95"), 129995);
  assert.equal(decimalAmount(minorAmount("0.10") + minorAmount("0.20")), "0.30");
  assert.throws(() => minorAmount("-1"));
  assert.throws(() => minorAmount("1.001"));
  assert.throws(() => decimalAmount(1.5));
  assert.throws(() => decimalAmount(1e14));
});

test("duplicate cart lines are merged while different variants and sizes stay separate", () => {
  const result = parseOrderLines([line, { ...line, quantity: 2 }, { ...line, size: "L" }]);
  assert.equal(result.length, 2);
  assert.equal(result[0].quantity, 3);
  assert.equal(result[1].quantity, 1);
});

test("cart validation rejects malformed IDs, quantities and oversized requests", () => {
  for (const input of [[], null, [null], [{ ...line, variantId: "fake" }], [{ ...line, quantity: -1 }], [{ ...line, quantity: 1.5 }], [{ ...line, quantity: 100 }], Array(51).fill(line)]) {
    assert.throws(() => parseOrderLines(input));
  }
  assert.throws(() => parseOrderLines([{ ...line, quantity: 99 }, line]));
});

test("status transitions prevent repeated stock allocation and terminal-order reopening", () => {
  assert.deepEqual(nextStatuses("pending"), ["processing", "cancelled"]);
  assert.equal(nextStatuses("processing").includes("pending"), false);
  assert.equal(nextStatuses("shipped").includes("cancelled"), false);
  assert.deepEqual(nextStatuses("cancelled"), []);
  assert.deepEqual(nextStatuses("delivered"), []);
});

test("delivery validation rejects executable tracking URLs and impossible dates", () => {
  assert.throws(() => parseDelivery({ ...delivery, trackingUrl: "javascript:alert(1)" }));
  assert.throws(() => parseDelivery({ ...delivery, trackingUrl: "http://example.com" }));
  assert.throws(() => parseDelivery({ ...delivery, estimatedDeliveryDate: "2026-02-30" }));
  const result = parseDelivery({ ...delivery, trackingUrl: "https://example.com/track", estimatedDeliveryDate: "2026-11-12" });
  assert.equal(result.trackingUrl, "https://example.com/track");
  assert.equal(result.estimatedDeliveryDate.toISOString(), "2026-11-11T18:30:00.000Z");
});
