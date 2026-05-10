import { BN } from "@coral-xyz/anchor";
import { getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { expect } from "chai";

import {
  bootstrap,
  CATEGORY,
  paymentReqHash,
  PolicyFixture,
  setupPolicyFixture,
  TestContext,
  usdc,
  ZERO_HASH,
} from "./helpers/fixtures";
import { findReceiptPda } from "./helpers/pda";

describe("permit402: close_policy", () => {
  let context: TestContext;
  let fixture: PolicyFixture;

  before(async () => {
    context = await bootstrap();
    fixture = await setupPolicyFixture(context, new BN(41));
  });

  it("sweeps remaining vault funds to owner and blocks future payments", async () => {
    const ownerBefore = await getAccount(
      context.provider.connection,
      context.ownerUsdcAta,
    );
    const vaultBefore = await getAccount(
      context.provider.connection,
      fixture.vaultAta,
    );
    expect(vaultBefore.amount.toString()).to.eq(usdc(200).toString());

    await context.program.methods
      .closePolicy()
      .accounts({
        owner: context.owner.publicKey,
        policyVault: fixture.policyPda,
        vaultAta: fixture.vaultAta,
        ownerAta: context.ownerUsdcAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([context.owner])
      .rpc();

    const ownerAfter = await getAccount(
      context.provider.connection,
      context.ownerUsdcAta,
    );
    const vaultAfter = await getAccount(
      context.provider.connection,
      fixture.vaultAta,
    );
    expect(vaultAfter.amount.toString()).to.eq("0");
    expect(ownerAfter.amount).to.eq(ownerBefore.amount + vaultBefore.amount);

    const policy = await context.program.account.policyVault.fetch(
      fixture.policyPda,
    );
    expect(policy.closed).to.eq(true);

    const nonce = new BN(901);
    const requestExpiresAt = Math.floor(Date.now() / 1000) + 600;
    const hash = paymentReqHash({
      method: "GET",
      url: "https://demo.permit402.dev/research",
      merchantWallet: context.merchantA.publicKey,
      merchantAta: fixture.merchantAta,
      amountBaseUnits: usdc(1),
      category: CATEGORY.RESEARCH,
      nonce: 901n,
      requestExpiresAt,
    });
    const [receiptPda] = findReceiptPda(
      context.programId,
      fixture.policyPda,
      nonce,
    );

    try {
      await context.program.methods
        .payX402({
          amount: new BN(usdc(1).toString()),
          category: CATEGORY.RESEARCH,
          nonce,
          paymentReqHash: hash,
          settlementSignatureHash: ZERO_HASH,
          requestExpiresAt: new BN(requestExpiresAt),
        })
        .accounts({
          signerAuthority: context.agent.publicKey,
          config: fixture.configPda,
          policyVault: fixture.policyPda,
          agentAuthority: fixture.agentAuthPda,
          merchant: fixture.merchantPda,
          merchantBinding: fixture.bindingPda,
          categoryBudget: fixture.budgetPda,
          vaultAta: fixture.vaultAta,
          merchantAta: fixture.merchantAta,
          receipt: receiptPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        })
        .signers([context.agent])
        .rpc();
      expect.fail("expected closed policy payment to fail");
    } catch (thrownObject) {
      expect(String(thrownObject)).to.include("Policy expired");
    }
  });
});
