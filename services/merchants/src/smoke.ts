import assert from "node:assert/strict";

import app from "./server";

for (const path of ["/health", "/research", "/translate", "/attacker"]) {
  const res = await app.request(`http://localhost:4021${path}`);
  if (path === "/health") {
    assert.equal(res.status, 200);
    continue;
  }
  assert.equal(res.status, 402);
  assert.ok(res.headers.get("PAYMENT-REQUIRED"));
}

console.log("merchant smoke passed");
