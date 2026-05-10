import assert from "node:assert/strict";

import app from "./server";

for (const path of ["/health", "/research", "/translate", "/attacker"]) {
  const res = await app.request(`http://localhost:4021${path}`);
  if (path === "/health") {
    assert.equal(res.status, 200);
    continue;
  }
  assert.equal(res.status, 402);
  const paymentReqHash = res.headers.get("PAYMENT-REQUIRED");
  assert.ok(paymentReqHash);

  const badRetry = await app.request(`http://localhost:4021${path}`, {
    headers: {
      "PAYMENT-SIGNATURE": "mock-permit402:wrong-hash",
    },
  });
  assert.equal(badRetry.status, 402);

  const paidRetry = await app.request(`http://localhost:4021${path}`, {
    headers: {
      "PAYMENT-SIGNATURE": `mock-permit402:${paymentReqHash}`,
    },
  });
  assert.equal(paidRetry.status, 200);
  assert.equal(paidRetry.headers.get("PAYMENT-RESPONSE"), paymentReqHash);
}

console.log("merchant smoke passed");
