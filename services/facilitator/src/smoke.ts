import assert from "node:assert/strict";

import app from "./server";

const health = await app.request("http://localhost:4022/health");
assert.equal(health.status, 200);

const first = await app.request("http://localhost:4022/preflight", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    policy: "policy",
    merchant: "merchant",
    nonce: "1",
    paymentReqHash: "abc",
  }),
});
assert.equal(first.status, 200);

const duplicate = await app.request("http://localhost:4022/preflight", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    policy: "policy",
    merchant: "merchant",
    nonce: "1",
    paymentReqHash: "abc",
  }),
});
assert.equal(duplicate.status, 409);

console.log("facilitator smoke passed");
