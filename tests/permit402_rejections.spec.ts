import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { expect } from "chai";

import {
  attemptHashPrefix,
  CATEGORY,
  paymentReqHash,
  TestContext,
  usdc,
  ZERO_HASH,
} from "./helpers/fixtures";
import {
  findBlockedAttemptPda,
  findCategoryBudgetPda,
  findConfigPda,
  findMerchantBindingPda,
  findMerchantPda,
  findPolicyPda,
  findReceiptPda,
} from "./helpers/pda";
import { ata } from "./helpers/token";

/**
 * These tests assume the policy/merchant/binding from permit402_policy.spec.ts
 * is already wired (anchor test runs all spec files in order against one validator).
 *
 * Each test calls record_blocked_attempt with a configuration that should classify
 * to a specific BlockReason, then asserts that the BlockedAttempt account stores
 * that exact reason.
 */
describe("permit402: blocked-attempt classification matrix", () => {
  let ctx: TestContext;
  const policyIndex = new BN(0);

  // The full BlockReason matrix from §8.5. Implementation must produce these
  // exact reason values; tests fail red until classify_attempt is implemented.
  const REASONS = {
    UnauthorizedAgent: 0,
    PolicyExpired: 1,
    MerchantNotAllowed: 2,
    ReceiptAlreadyExists: 3,
    PerCallCapExceeded: 4,
    MerchantCapExceeded: 5,
    CategoryCapExceeded: 6,
    TotalCapExceeded: 7,
    DailyCapExceeded: 8,
    PaymentRequestHashMismatch: 9,
  } as const;

  before(async () => {
    const { bootstrap } = await import("./helpers/fixtures");
    ctx = await bootstrap();
    // NOTE: Phase 5 implementation must wire this fixture to call
    // init_config/create_policy/register_merchant/add_merchant/set_category_budget
    // in the `before` block so each rejection test has a real policy + merchant
    // to attempt against. Until then these tests fail red on the missing setup.
  });

  it("UnauthorizedAgent: unapproved attempted_authority can record its own attempt", async () => {
    const [policyPda] = findPolicyPda(ctx.programId, ctx.owner.publicKey, policyIndex);
    const [merchantPda] = findMerchantPda(ctx.programId, ctx.merchantA.publicKey);
    const [bindingPda] = findMerchantBindingPda(ctx.programId, policyPda, merchantPda);
    const [budgetPda] = findCategoryBudgetPda(ctx.programId, policyPda, CATEGORY.RESEARCH);
    const [configPda] = findConfigPda(ctx.programId);
    const vaultAta = ata(ctx.usdcMint, policyPda, true);
    const merchantAta = ata(ctx.usdcMint, ctx.merchantA.publicKey);
    const nonce = new BN(100);
    const [receiptPda] = findReceiptPda(ctx.programId, policyPda, nonce);
    const prefix = Buffer.from(attemptHashPrefix(REASONS.UnauthorizedAgent, 100n));
    const [blockedPda] = findBlockedAttemptPda(ctx.programId, policyPda, nonce, prefix);

    await ctx.program.methods
      .recordBlockedAttempt({
        attemptedAuthority: ctx.attacker.publicKey,
        amount: new BN(usdc(1).toString()),
        category: CATEGORY.RESEARCH,
        nonce,
        paymentReqHash: ZERO_HASH,
        expectedPaymentReqHash: ZERO_HASH,
        claimedReason: REASONS.UnauthorizedAgent,
        attemptHashPrefix: Array.from(prefix),
        requestExpiresAt: new BN(Math.floor(Date.now() / 1000) + 600),
      })
      .accounts({
        recorder: ctx.attacker.publicKey,
        config: configPda,
        policyVault: policyPda,
        merchant: merchantPda,
        merchantBinding: bindingPda,
        categoryBudget: budgetPda,
        vaultAta,
        receipt: receiptPda,
        blockedAttempt: blockedPda,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([ctx.attacker])
      .rpc();

    const blocked = await ctx.program.account.blockedAttempt.fetch(blockedPda);
    expect(blocked.reason).to.eq(REASONS.UnauthorizedAgent);
    expect(blocked.attemptedAuthority.toBase58()).to.eq(ctx.attacker.publicKey.toBase58());
  });

  it("MerchantNotAllowed: keeper records attempt against unbound merchant", async () => {
    const [policyPda] = findPolicyPda(ctx.programId, ctx.owner.publicKey, policyIndex);
    const [merchantPda] = findMerchantPda(ctx.programId, ctx.attackerMerchant.publicKey);
    const [bindingPda] = findMerchantBindingPda(ctx.programId, policyPda, merchantPda);
    const [budgetPda] = findCategoryBudgetPda(ctx.programId, policyPda, CATEGORY.RESEARCH);
    const [configPda] = findConfigPda(ctx.programId);
    const vaultAta = ata(ctx.usdcMint, policyPda, true);
    const nonce = new BN(101);
    const [receiptPda] = findReceiptPda(ctx.programId, policyPda, nonce);
    const prefix = Buffer.from(attemptHashPrefix(REASONS.MerchantNotAllowed, 101n));
    const [blockedPda] = findBlockedAttemptPda(ctx.programId, policyPda, nonce, prefix);

    await ctx.program.methods
      .recordBlockedAttempt({
        attemptedAuthority: ctx.agent.publicKey,
        amount: new BN(usdc(1).toString()),
        category: CATEGORY.RESEARCH,
        nonce,
        paymentReqHash: ZERO_HASH,
        expectedPaymentReqHash: ZERO_HASH,
        claimedReason: REASONS.MerchantNotAllowed,
        attemptHashPrefix: Array.from(prefix),
        requestExpiresAt: new BN(Math.floor(Date.now() / 1000) + 600),
      })
      .accounts({
        recorder: ctx.keeper.publicKey,
        config: configPda,
        policyVault: policyPda,
        merchant: merchantPda,
        merchantBinding: bindingPda,
        categoryBudget: budgetPda,
        vaultAta,
        receipt: receiptPda,
        blockedAttempt: blockedPda,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([ctx.keeper])
      .rpc();

    const blocked = await ctx.program.account.blockedAttempt.fetch(blockedPda);
    expect(blocked.reason).to.eq(REASONS.MerchantNotAllowed);
  });

  it("PerCallCapExceeded: amount above per-call cap classifies correctly", async () => {
    // Placeholder: identical wiring to MerchantNotAllowed but against an allowed
    // merchant with amount > per_call_cap. Will be filled in once Phase 5 lands
    // and we verify classify_attempt priorities end-to-end.
    expect.fail("TODO: implement after classify_attempt helper is in place");
  });

  it("PaymentRequestHashMismatch: keeper-only path", async () => {
    expect.fail("TODO: keeper signs with expected_payment_req_hash != payment_req_hash");
  });

  it("PaymentRequestHashMismatch: non-keeper recorder is rejected", async () => {
    expect.fail("TODO: attempted_authority recorder must hit KeeperOnlyMismatch");
  });

  it("AttemptWouldPass: refuses to write a blocked artifact for a passing attempt", async () => {
    expect.fail("TODO: program returns AttemptWouldPass error, no account is created");
  });
});
