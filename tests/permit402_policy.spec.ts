import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";
import {
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { expect } from "chai";

import {
  bootstrap,
  CATEGORY,
  endpointHash,
  nameBytes,
  paymentReqHash,
  TestContext,
  usdc,
  ZERO_HASH,
} from "./helpers/fixtures";
import {
  findAgentAuthorityPda,
  findCategoryBudgetPda,
  findConfigPda,
  findMerchantBindingPda,
  findMerchantPda,
  findPolicyPda,
  findReceiptPda,
} from "./helpers/pda";
import { ata } from "./helpers/token";

describe("permit402: policy lifecycle (happy path)", () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await bootstrap();
  });

  it("init_config creates the global config", async () => {
    const [configPda] = findConfigPda(ctx.programId);
    await ctx.program.methods
      .initConfig({
        usdcMint: ctx.usdcMint,
        keeperAuthority: ctx.keeper.publicKey,
        feeBps: 0,
      })
      .accounts({
        admin: ctx.admin.publicKey,
        config: configPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.admin])
      .rpc();

    const cfg = await ctx.program.account.config.fetch(configPda);
    expect(cfg.usdcMint.toBase58()).to.eq(ctx.usdcMint.toBase58());
    expect(cfg.keeperAuthority.toBase58()).to.eq(
      ctx.keeper.publicKey.toBase58(),
    );
    expect(cfg.feeBps).to.eq(0);
  });

  it("create_policy + fund_policy initializes a vault and deposits USDC", async () => {
    const policyIndex = new BN(0);
    const expiresAt = new BN(Math.floor(Date.now() / 1000) + 3600);
    const [policyPda] = findPolicyPda(
      ctx.programId,
      ctx.owner.publicKey,
      policyIndex,
    );
    const [agentAuthPda] = findAgentAuthorityPda(
      ctx.programId,
      policyPda,
      ctx.agent.publicKey,
    );
    const [configPda] = findConfigPda(ctx.programId);
    const vaultAta = ata(ctx.usdcMint, policyPda, true);

    await ctx.program.methods
      .createPolicy({
        policyIndex,
        agentAuthority: ctx.agent.publicKey,
        totalCap: new BN(usdc(500).toString()),
        dailyCap: new BN(usdc(100).toString()),
        perCallCap: new BN(usdc(10).toString()),
        expiresAt,
      })
      .accounts({
        owner: ctx.owner.publicKey,
        config: configPda,
        policyVault: policyPda,
        agentAuthority: agentAuthPda,
        usdcMint: ctx.usdcMint,
        vaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([ctx.owner])
      .rpc();

    await ctx.program.methods
      .fundPolicy(new BN(usdc(200).toString()))
      .accounts({
        owner: ctx.owner.publicKey,
        policyVault: policyPda,
        usdcMint: ctx.usdcMint,
        ownerAta: ctx.ownerUsdcAta,
        vaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ctx.owner])
      .rpc();

    const vault = await getAccount(ctx.provider.connection, vaultAta);
    expect(vault.amount.toString()).to.eq(usdc(200).toString());
  });

  it("register_merchant + add_merchant + set_category_budget wire up a merchant", async () => {
    const [merchantPda] = findMerchantPda(
      ctx.programId,
      ctx.merchantA.publicKey,
    );
    const merchantAta = ata(ctx.usdcMint, ctx.merchantA.publicKey);

    await ctx.program.methods
      .registerMerchant({
        name: nameBytes("research-api"),
        endpointHash: endpointHash("https://demo.permit402.dev/research"),
        category: CATEGORY.RESEARCH,
      })
      .accounts({
        registrar: ctx.owner.publicKey,
        merchantWallet: ctx.merchantA.publicKey,
        usdcMint: ctx.usdcMint,
        merchantAta,
        merchant: merchantPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.owner])
      .rpc();

    const policyIndex = new BN(0);
    const [policyPda] = findPolicyPda(
      ctx.programId,
      ctx.owner.publicKey,
      policyIndex,
    );
    const [bindingPda] = findMerchantBindingPda(
      ctx.programId,
      policyPda,
      merchantPda,
    );

    await ctx.program.methods
      .addMerchant({
        perCallCap: new BN(usdc(5).toString()),
        perMerchantCap: new BN(usdc(50).toString()),
      })
      .accounts({
        owner: ctx.owner.publicKey,
        policyVault: policyPda,
        merchant: merchantPda,
        merchantBinding: bindingPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.owner])
      .rpc();

    const [budgetPda] = findCategoryBudgetPda(
      ctx.programId,
      policyPda,
      CATEGORY.RESEARCH,
    );
    await ctx.program.methods
      .setCategoryBudget(CATEGORY.RESEARCH, new BN(usdc(60).toString()))
      .accounts({
        owner: ctx.owner.publicKey,
        policyVault: policyPda,
        categoryBudget: budgetPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.owner])
      .rpc();

    const binding = await ctx.program.account.merchantBinding.fetch(bindingPda);
    expect(binding.allowed).to.eq(true);
  });

  it("pay_x402 transfers USDC and creates a Receipt PDA", async () => {
    const policyIndex = new BN(0);
    const [policyPda] = findPolicyPda(
      ctx.programId,
      ctx.owner.publicKey,
      policyIndex,
    );
    const [merchantPda] = findMerchantPda(
      ctx.programId,
      ctx.merchantA.publicKey,
    );
    const [bindingPda] = findMerchantBindingPda(
      ctx.programId,
      policyPda,
      merchantPda,
    );
    const [budgetPda] = findCategoryBudgetPda(
      ctx.programId,
      policyPda,
      CATEGORY.RESEARCH,
    );
    const [agentAuthPda] = findAgentAuthorityPda(
      ctx.programId,
      policyPda,
      ctx.agent.publicKey,
    );
    const [configPda] = findConfigPda(ctx.programId);
    const vaultAta = ata(ctx.usdcMint, policyPda, true);
    const merchantAta = ata(ctx.usdcMint, ctx.merchantA.publicKey);

    const nonce = new BN(1);
    const requestExpiresAt = Math.floor(Date.now() / 1000) + 600;
    const hash = paymentReqHash({
      method: "GET",
      url: "https://demo.permit402.dev/research",
      merchantWallet: ctx.merchantA.publicKey,
      merchantAta,
      amountBaseUnits: usdc(2),
      category: CATEGORY.RESEARCH,
      nonce: 1n,
      requestExpiresAt,
    });
    const [receiptPda] = findReceiptPda(ctx.programId, policyPda, nonce);

    await ctx.program.methods
      .payX402({
        amount: new BN(usdc(2).toString()),
        category: CATEGORY.RESEARCH,
        nonce,
        paymentReqHash: hash,
        settlementSignatureHash: ZERO_HASH,
        requestExpiresAt: new BN(requestExpiresAt),
      })
      .accounts({
        signerAuthority: ctx.agent.publicKey,
        config: configPda,
        policyVault: policyPda,
        agentAuthority: agentAuthPda,
        merchant: merchantPda,
        merchantBinding: bindingPda,
        categoryBudget: budgetPda,
        vaultAta,
        merchantAta,
        receipt: receiptPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([ctx.agent])
      .rpc();

    const receipt = await ctx.program.account.receipt.fetch(receiptPda);
    expect(receipt.amount.toString()).to.eq(usdc(2).toString());
    expect(receipt.nonce.toString()).to.eq("1");
    expect(receipt.category).to.eq(CATEGORY.RESEARCH);

    const merchantBalance = await getAccount(
      ctx.provider.connection,
      merchantAta,
    );
    expect(merchantBalance.amount.toString()).to.eq(usdc(2).toString());
  });
});
