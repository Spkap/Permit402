import { describe, expect, it } from "vitest";

import { BLOCK_REASON_ORDER, BlockReason } from "./block-reason.js";

describe("BlockReason", () => {
  it("matches the Rust enum discriminants in canonical priority order", () => {
    expect(BLOCK_REASON_ORDER).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(BlockReason.UnauthorizedAgent).toBe(0);
    expect(BlockReason.PolicyExpired).toBe(1);
    expect(BlockReason.MerchantNotAllowed).toBe(2);
    expect(BlockReason.ReceiptAlreadyExists).toBe(3);
    expect(BlockReason.PerCallCapExceeded).toBe(4);
    expect(BlockReason.MerchantCapExceeded).toBe(5);
    expect(BlockReason.CategoryCapExceeded).toBe(6);
    expect(BlockReason.TotalCapExceeded).toBe(7);
    expect(BlockReason.DailyCapExceeded).toBe(8);
    expect(BlockReason.PaymentRequestHashMismatch).toBe(9);
  });
});
