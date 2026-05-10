import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";

import { BLOCK_REASON, CATEGORY, paymentReqHash, toHex } from "./index.js";

describe("shared package aggregate exports", () => {
  it("exports policy constants and x402 hash helpers", () => {
    const merchantWallet = new PublicKey("11111111111111111111111111111112");
    const merchantAta = new PublicKey("11111111111111111111111111111113");

    const hash = paymentReqHash({
      method: "GET",
      url: "https://demo.permit402.dev/research",
      merchantWallet,
      merchantAta,
      amountBaseUnits: 2_000_000n,
      category: CATEGORY.RESEARCH,
      nonce: 1n,
      requestExpiresAt: 1_778_400_000,
    });

    expect(hash).toHaveLength(32);
    expect(toHex(hash)).toBe(
      "eabbac42e6957eb983e55ca7dc6a6ad47061c89efa42d6e076381526a74394ea",
    );
    expect(BLOCK_REASON.UnauthorizedAgent).toBe(0);
    expect(BLOCK_REASON.PaymentRequestHashMismatch).toBe(9);
  });
});
