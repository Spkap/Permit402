import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { expect } from "chai";

import {
  attemptHashPrefix,
  CATEGORY,
  PolicyFixture,
  paymentReqHash,
  setupPolicyFixture,
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
  let fx: PolicyFixture;
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
    fx = await setupPolicyFixture(ctx, policyIndex);
  });

  function validHash(
    nonce: bigint,
    amountBaseUnits = usdc(1),
  ): { hash: number[]; requestExpiresAt: number } {
    const requestExpiresAt = Math.floor(Date.now() / 1000) + 600;
    return {
      requestExpiresAt,
      hash: paymentReqHash({
        method: "GET",
        url: "https://demo.permit402.dev/research",
        merchantWallet: ctx.merchantA.publicKey,
        merchantAta: fx.merchantAta,
        amountBaseUnits,
        category: CATEGORY.RESEARCH,
        nonce,
        requestExpiresAt,
      }),
    };
  }

  it("UnauthorizedAgent: unapproved attempted_authority can record its own attempt", async () => {
    const nonce = new BN(100);
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);
    const prefix = Buffer.from(
      attemptHashPrefix(REASONS.UnauthorizedAgent, 100n),
    );
    const [blockedPda] = findBlockedAttemptPda(
      ctx.programId,
      fx.policyPda,
      nonce,
      prefix,
    );

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
        config: fx.configPda,
        policyVault: fx.policyPda,
        merchant: fx.merchantPda,
        merchantBinding: fx.bindingPda,
        categoryBudget: fx.budgetPda,
        vaultAta: fx.vaultAta,
        receipt: receiptPda,
        blockedAttempt: blockedPda,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([ctx.attacker])
      .rpc();

    const blocked = await ctx.program.account.blockedAttempt.fetch(blockedPda);
    expect(blocked.reason).to.eq(REASONS.UnauthorizedAgent);
    expect(blocked.attemptedAuthority.toBase58()).to.eq(
      ctx.attacker.publicKey.toBase58(),
    );
  });

  it("MerchantNotAllowed: keeper records attempt against unbound merchant", async () => {
    const nonce = new BN(101);
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);
    const prefix = Buffer.from(
      attemptHashPrefix(REASONS.MerchantNotAllowed, 101n),
    );
    const [blockedPda] = findBlockedAttemptPda(
      ctx.programId,
      fx.policyPda,
      nonce,
      prefix,
    );

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
        config: fx.configPda,
        policyVault: fx.policyPda,
        merchant: fx.attackerMerchantPda,
        merchantBinding: fx.attackerBindingPda,
        categoryBudget: fx.budgetPda,
        vaultAta: fx.vaultAta,
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
    const nonce = new BN(102);
    const attempt = validHash(102n, usdc(6));
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);
    const prefix = Buffer.from(
      attemptHashPrefix(REASONS.PerCallCapExceeded, 102n),
    );
    const [blockedPda] = findBlockedAttemptPda(
      ctx.programId,
      fx.policyPda,
      nonce,
      prefix,
    );

    await ctx.program.methods
      .recordBlockedAttempt({
        attemptedAuthority: ctx.agent.publicKey,
        amount: new BN(usdc(6).toString()),
        category: CATEGORY.RESEARCH,
        nonce,
        paymentReqHash: attempt.hash,
        expectedPaymentReqHash: attempt.hash,
        claimedReason: REASONS.PerCallCapExceeded,
        attemptHashPrefix: Array.from(prefix),
        requestExpiresAt: new BN(attempt.requestExpiresAt),
      })
      .accounts({
        recorder: ctx.keeper.publicKey,
        config: fx.configPda,
        policyVault: fx.policyPda,
        merchant: fx.merchantPda,
        merchantBinding: fx.bindingPda,
        categoryBudget: fx.budgetPda,
        vaultAta: fx.vaultAta,
        receipt: receiptPda,
        blockedAttempt: blockedPda,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([ctx.keeper])
      .rpc();

    const blocked = await ctx.program.account.blockedAttempt.fetch(blockedPda);
    expect(blocked.reason).to.eq(REASONS.PerCallCapExceeded);
  });

  it("PaymentRequestHashMismatch: keeper-only path", async () => {
    const nonce = new BN(103);
    const attempt = validHash(103n);
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);
    const prefix = Buffer.from(
      attemptHashPrefix(REASONS.PaymentRequestHashMismatch, 103n),
    );
    const [blockedPda] = findBlockedAttemptPda(
      ctx.programId,
      fx.policyPda,
      nonce,
      prefix,
    );
    const expected = Array.from(Buffer.alloc(32, 7));

    await ctx.program.methods
      .recordBlockedAttempt({
        attemptedAuthority: ctx.agent.publicKey,
        amount: new BN(usdc(1).toString()),
        category: CATEGORY.RESEARCH,
        nonce,
        paymentReqHash: attempt.hash,
        expectedPaymentReqHash: expected,
        claimedReason: REASONS.PaymentRequestHashMismatch,
        attemptHashPrefix: Array.from(prefix),
        requestExpiresAt: new BN(attempt.requestExpiresAt),
      })
      .accounts({
        recorder: ctx.keeper.publicKey,
        config: fx.configPda,
        policyVault: fx.policyPda,
        merchant: fx.merchantPda,
        merchantBinding: fx.bindingPda,
        categoryBudget: fx.budgetPda,
        vaultAta: fx.vaultAta,
        receipt: receiptPda,
        blockedAttempt: blockedPda,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([ctx.keeper])
      .rpc();

    const blocked = await ctx.program.account.blockedAttempt.fetch(blockedPda);
    expect(blocked.reason).to.eq(REASONS.PaymentRequestHashMismatch);
  });

  it("PaymentRequestHashMismatch: non-keeper recorder is rejected", async () => {
    const nonce = new BN(104);
    const attempt = validHash(104n);
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);
    const prefix = Buffer.from(
      attemptHashPrefix(REASONS.PaymentRequestHashMismatch, 104n),
    );
    const [blockedPda] = findBlockedAttemptPda(
      ctx.programId,
      fx.policyPda,
      nonce,
      prefix,
    );
    const expected = Array.from(Buffer.alloc(32, 9));

    try {
      await ctx.program.methods
        .recordBlockedAttempt({
          attemptedAuthority: ctx.agent.publicKey,
          amount: new BN(usdc(1).toString()),
          category: CATEGORY.RESEARCH,
          nonce,
          paymentReqHash: attempt.hash,
          expectedPaymentReqHash: expected,
          claimedReason: REASONS.PaymentRequestHashMismatch,
          attemptHashPrefix: Array.from(prefix),
          requestExpiresAt: new BN(attempt.requestExpiresAt),
        })
        .accounts({
          recorder: ctx.agent.publicKey,
          config: fx.configPda,
          policyVault: fx.policyPda,
          merchant: fx.merchantPda,
          merchantBinding: fx.bindingPda,
          categoryBudget: fx.budgetPda,
          vaultAta: fx.vaultAta,
          receipt: receiptPda,
          blockedAttempt: blockedPda,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        })
        .signers([ctx.agent])
        .rpc();
      expect.fail("expected KeeperOnlyMismatch");
    } catch (err) {
      expect(String(err)).to.include("Only the keeper authority");
    }
  });

  it("AttemptWouldPass: refuses to write a blocked artifact for a passing attempt", async () => {
    const nonce = new BN(105);
    const attempt = validHash(105n);
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);
    const prefix = Buffer.from(
      attemptHashPrefix(REASONS.PerCallCapExceeded, 105n),
    );
    const [blockedPda] = findBlockedAttemptPda(
      ctx.programId,
      fx.policyPda,
      nonce,
      prefix,
    );

    try {
      await ctx.program.methods
        .recordBlockedAttempt({
          attemptedAuthority: ctx.agent.publicKey,
          amount: new BN(usdc(1).toString()),
          category: CATEGORY.RESEARCH,
          nonce,
          paymentReqHash: attempt.hash,
          expectedPaymentReqHash: attempt.hash,
          claimedReason: REASONS.PerCallCapExceeded,
          attemptHashPrefix: Array.from(prefix),
          requestExpiresAt: new BN(attempt.requestExpiresAt),
        })
        .accounts({
          recorder: ctx.keeper.publicKey,
          config: fx.configPda,
          policyVault: fx.policyPda,
          merchant: fx.merchantPda,
          merchantBinding: fx.bindingPda,
          categoryBudget: fx.budgetPda,
          vaultAta: fx.vaultAta,
          receipt: receiptPda,
          blockedAttempt: blockedPda,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        })
        .signers([ctx.keeper])
        .rpc();
      expect.fail("expected AttemptWouldPass");
    } catch (err) {
      expect(String(err)).to.include("Attempt would have passed");
    }
  });
});
