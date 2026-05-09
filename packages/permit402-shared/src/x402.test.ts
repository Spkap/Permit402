import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";

import {
  canonicalPaymentRequestMessage,
  paymentReqHashHex,
} from "./x402.js";

describe("x402 payment request hashing", () => {
  const fixture = {
    method: "GET",
    url: "https://demo.permit402.dev/research",
    merchantWallet: new PublicKey("11111111111111111111111111111112"),
    merchantAta: new PublicKey("11111111111111111111111111111113"),
    amountBaseUnits: 2_000_000n,
    category: 0,
    nonce: 1n,
    requestExpiresAt: 1_775_000_000,
  };

  it("canonicalizes to newline-delimited scalar fields", () => {
    expect(canonicalPaymentRequestMessage(fixture)).toBe(
      [
        "GET",
        "https://demo.permit402.dev/research",
        "11111111111111111111111111111112",
        "11111111111111111111111111111113",
        "2000000",
        "0",
        "1",
        "1775000000",
      ].join("\n"),
    );
  });

  it("returns a stable sha256 hash for the fixture", () => {
    expect(paymentReqHashHex(fixture)).toBe(
      "aa169ee29549a6bfa1f0e4621410892f7c621803a2648d1d38432ddf8f3a60d3",
    );
  });
});
