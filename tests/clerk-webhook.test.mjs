import assert from "node:assert/strict";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { createRequire } from "node:module";
const { verifyWebhook } = createRequire(import.meta.url)("@clerk/nextjs/webhooks");

const key = randomBytes(32);
const signingSecret = `whsec_${key.toString("base64")}`;
const body = JSON.stringify({ type: "session.created", data: { id: "sess_test" }, object: "event", timestamp: Date.now() });
const id = `msg_${randomUUID()}`;
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");

function request(payload = body, headers = {}) {
  return new NextRequest("http://localhost/api/webhooks/clerk", {
    method: "POST", body: payload,
    headers: { "content-type": "application/json", "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v1,${signature}`, ...headers },
  });
}

test("Clerk accepts a correctly signed webhook", async () => {
  assert.equal((await verifyWebhook(request(), { signingSecret })).type, "session.created");
});

test("Clerk rejects a modified webhook body", async () => {
  await assert.rejects(() => verifyWebhook(request(body + " "), { signingSecret }));
});

test("Clerk rejects expired and invalid webhook signatures", async () => {
  await assert.rejects(() => verifyWebhook(request(body, { "svix-timestamp": "1" }), { signingSecret }));
  await assert.rejects(() => verifyWebhook(request(body, { "svix-signature": "v1,invalid" }), { signingSecret }));
});
