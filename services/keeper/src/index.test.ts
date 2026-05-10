import { describe, expect, it } from "vitest";
import { BLOCK_REASON } from "@permit402/shared";
import {
  buildPermit402Memo,
  parsePermit402Memo,
  requirePermit402Memo,
  summarizeDecision,
} from "./index.js";

describe("Permit402 keeper memo helpers", () => {
  it("builds and parses Permit402 x402 settlement memos", () => {
    const memo = buildPermit402Memo({
      nonce: 42n,
      paymentReqHashPrefix: "0xAABBccdd00112233",
    });

    expect(memo).toBe("permit402:nonce:42:hash:aabbccdd00112233");
    expect(parsePermit402Memo(memo)).toEqual({
      raw: memo,
      nonce: 42n,
      paymentReqHashPrefix: "aabbccdd00112233",
    });
  });

  it("rejects malformed memos", () => {
    expect(parsePermit402Memo("permit402:nonce:-1:hash:aabbccdd")).toBeNull();
    expect(parsePermit402Memo("permit402:nonce:1:hash:abc")).toBeNull();
    expect(parsePermit402Memo("memo:nonce:1:hash:aabbccdd")).toBeNull();
    expect(() => requirePermit402Memo("permit402:nonce:1:hash:abc")).toThrow(
      /Invalid Permit402 memo/,
    );
    expect(() =>
      buildPermit402Memo({ nonce: -1, paymentReqHashPrefix: "aabbccdd" }),
    ).toThrow(/nonce/);
  });

  it("summarizes blocked decisions with reason labels", () => {
    expect(
      summarizeDecision({
        kind: "block",
        policy: "policy",
        merchant: "merchant",
        amountBaseUnits: "1000000",
        category: 0,
        nonce: "1",
        paymentReqHash: "hash",
        reason: BLOCK_REASON.MerchantNotAllowed,
      }),
    ).toBe("block 1000000 to merchant for policy policy: MerchantNotAllowed");
  });
});
