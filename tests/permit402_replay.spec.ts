import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { expect } from "chai";

import {
  attemptHashPrefix,
  bootstrap,
  CATEGORY,
  PolicyFixture,
  paymentReqHash,
  setupPolicyFixture,
  TestContext,
  usdc,
  ZERO_HASH,
} from "./helpers/fixtures";
import {
  findAgentAuthorityPda,
  findBlockedAttemptPda,
  findCategoryBudgetPda,
  findConfigPda,
  findMerchantBindingPda,
  findMerchantPda,
  findPolicyPda,
  findReceiptPda,
} from "./helpers/pda";
import { ata } from "./helpers/token";

describe("permit402: replay protection via Receipt PDA collision", () => {
  let ctx: TestContext;
  let fx: PolicyFixture;

  before(async () => {
    ctx = await bootstrap();
    fx = await setupPolicyFixture(ctx, new BN(0));
  });

  it("re-using the same nonce a second time fails (ReceiptAlreadyExists)", async () => {
    const nonce = new BN(200);
    const requestExpiresAt = Math.floor(Date.now() / 1000) + 600;
    const hash = paymentReqHash({
      method: "GET",
      url: "https://demo.permit402.dev/research",
      merchantWallet: ctx.merchantA.publicKey,
      merchantAta: fx.merchantAta,
      amountBaseUnits: usdc(1),
      category: CATEGORY.RESEARCH,
      nonce: 200n,
      requestExpiresAt,
    });
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);

    await ctx.program.methods
      .payX402({
        amount: new BN(usdc(1).toString()),
        category: CATEGORY.RESEARCH,
        nonce,
        paymentReqHash: hash,
        settlementSignatureHash: ZERO_HASH,
        requestExpiresAt: new BN(requestExpiresAt),
      })
      .accounts({
        signerAuthority: ctx.agent.publicKey,
        config: fx.configPda,
        policyVault: fx.policyPda,
        agentAuthority: fx.agentAuthPda,
        merchant: fx.merchantPda,
        merchantBinding: fx.bindingPda,
        categoryBudget: fx.budgetPda,
        vaultAta: fx.vaultAta,
        merchantAta: fx.merchantAta,
        receipt: receiptPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([ctx.agent])
      .rpc();

    try {
      await ctx.program.methods
        .payX402({
          amount: new BN(usdc(1).toString()),
          category: CATEGORY.RESEARCH,
          nonce,
          paymentReqHash: hash,
          settlementSignatureHash: ZERO_HASH,
          requestExpiresAt: new BN(requestExpiresAt),
        })
        .accounts({
          signerAuthority: ctx.agent.publicKey,
          config: fx.configPda,
          policyVault: fx.policyPda,
          agentAuthority: fx.agentAuthPda,
          merchant: fx.merchantPda,
          merchantBinding: fx.bindingPda,
          categoryBudget: fx.budgetPda,
          vaultAta: fx.vaultAta,
          merchantAta: fx.merchantAta,
          receipt: receiptPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        })
        .signers([ctx.agent])
        .rpc();
      expect.fail("expected duplicate receipt PDA failure");
    } catch (err) {
      expect(String(err)).to.include("already in use");
    }
  });

  it("the same nonce can still be recorded as a BlockedAttempt with a different attempt_hash_prefix", async () => {
    const nonce = new BN(200);
    const [receiptPda] = findReceiptPda(ctx.programId, fx.policyPda, nonce);
    const prefix = Buffer.from(attemptHashPrefix(3, 200n));
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
        claimedReason: 3,
        attemptHashPrefix: Array.from(prefix),
        requestExpiresAt: new BN(Math.floor(Date.now() / 1000) + 600),
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
    expect(blocked.reason).to.eq(3);
  });
});
