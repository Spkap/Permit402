import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  MerchantCategory,
  paymentReqHash as sharedPaymentReqHash,
} from "@permit402/shared";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import { createHash } from "crypto";

import {
  findAgentAuthorityPda,
  findCategoryBudgetPda,
  findConfigPda,
  findMerchantBindingPda,
  findMerchantPda,
  findPolicyPda,
} from "./pda";
import {
  airdrop,
  ata,
  createUsdcMint,
  ensureAta,
  mintUsdc,
  USDC_DECIMALS,
} from "./token";

export const CATEGORY = {
  RESEARCH: MerchantCategory.Research,
  TRANSLATE: MerchantCategory.Translate,
  STORAGE: MerchantCategory.Storage,
  TOOLING: MerchantCategory.Tooling,
} as const;

export type CategoryKey = keyof typeof CATEGORY;

export const usdc = (units: number): bigint =>
  BigInt(units) * 10n ** BigInt(USDC_DECIMALS);

export interface TestContext {
  provider: AnchorProvider;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: Program<any>;
  programId: PublicKey;
  admin: Keypair;
  owner: Keypair;
  agent: Keypair;
  keeper: Keypair;
  attacker: Keypair;
  merchantA: Keypair;
  merchantB: Keypair;
  attackerMerchant: Keypair;
  usdcMint: PublicKey;
  ownerUsdcAta: PublicKey;
}

export interface PolicyFixture {
  policyIndex: BN;
  policyPda: PublicKey;
  agentAuthPda: PublicKey;
  configPda: PublicKey;
  merchantPda: PublicKey;
  attackerMerchantPda: PublicKey;
  bindingPda: PublicKey;
  attackerBindingPda: PublicKey;
  budgetPda: PublicKey;
  vaultAta: PublicKey;
  merchantAta: PublicKey;
  attackerMerchantAta: PublicKey;
}

export async function bootstrap(
  programName = "permit402",
): Promise<TestContext> {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = anchor.workspace[programName] as Program<any>;

  const admin = Keypair.generate();
  const owner = Keypair.generate();
  const agent = Keypair.generate();
  const keeper = Keypair.generate();
  const attacker = Keypair.generate();
  const merchantA = Keypair.generate();
  const merchantB = Keypair.generate();
  const attackerMerchant = Keypair.generate();

  for (const kp of [admin, owner, agent, keeper, attacker]) {
    await airdrop(provider.connection, kp.publicKey, 5);
  }

  const usdcMint = await createUsdcMint(
    provider.connection,
    admin,
    admin.publicKey,
  );
  const ownerUsdcAta = await ensureAta(
    provider.connection,
    admin,
    usdcMint,
    owner.publicKey,
  );
  await mintUsdc(
    provider.connection,
    admin,
    usdcMint,
    admin,
    ownerUsdcAta,
    usdc(1000),
  );

  // Pre-create merchant ATAs so register_merchant can validate them.
  for (const m of [merchantA, merchantB, attackerMerchant]) {
    await ensureAta(provider.connection, admin, usdcMint, m.publicKey);
  }

  return {
    provider,
    program,
    programId: program.programId,
    admin,
    owner,
    agent,
    keeper,
    attacker,
    merchantA,
    merchantB,
    attackerMerchant,
    usdcMint,
    ownerUsdcAta,
  };
}

export async function setupPolicyFixture(
  ctx: TestContext,
  policyIndex = new BN(0),
): Promise<PolicyFixture> {
  const [configPda] = findConfigPda(ctx.programId);
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
  const [merchantPda] = findMerchantPda(ctx.programId, ctx.merchantA.publicKey);
  const [attackerMerchantPda] = findMerchantPda(
    ctx.programId,
    ctx.attackerMerchant.publicKey,
  );
  const [bindingPda] = findMerchantBindingPda(
    ctx.programId,
    policyPda,
    merchantPda,
  );
  const [attackerBindingPda] = findMerchantBindingPda(
    ctx.programId,
    policyPda,
    attackerMerchantPda,
  );
  const [budgetPda] = findCategoryBudgetPda(
    ctx.programId,
    policyPda,
    CATEGORY.RESEARCH,
  );
  const vaultAta = ata(ctx.usdcMint, policyPda, true);
  const merchantAta = ata(ctx.usdcMint, ctx.merchantA.publicKey);
  const attackerMerchantAta = ata(ctx.usdcMint, ctx.attackerMerchant.publicKey);

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

  await ctx.program.methods
    .createPolicy({
      policyIndex,
      agentAuthority: ctx.agent.publicKey,
      totalCap: new BN(usdc(500).toString()),
      dailyCap: new BN(usdc(100).toString()),
      perCallCap: new BN(usdc(10).toString()),
      expiresAt: new BN(Math.floor(Date.now() / 1000) + 3600),
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

  for (const merchant of [
    {
      wallet: ctx.merchantA.publicKey,
      merchant: merchantPda,
      merchantAta,
      name: "research-api",
      endpoint: "https://demo.permit402.dev/research",
    },
    {
      wallet: ctx.attackerMerchant.publicKey,
      merchant: attackerMerchantPda,
      merchantAta: attackerMerchantAta,
      name: "attacker-api",
      endpoint: "https://evil.example/pay",
    },
  ]) {
    await ctx.program.methods
      .registerMerchant({
        name: nameBytes(merchant.name),
        endpointHash: endpointHash(merchant.endpoint),
        category: CATEGORY.RESEARCH,
      })
      .accounts({
        registrar: ctx.owner.publicKey,
        merchantWallet: merchant.wallet,
        usdcMint: ctx.usdcMint,
        merchantAta: merchant.merchantAta,
        merchant: merchant.merchant,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.owner])
      .rpc();
  }

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

  return {
    policyIndex,
    policyPda,
    agentAuthPda,
    configPda,
    merchantPda,
    attackerMerchantPda,
    bindingPda,
    attackerBindingPda,
    budgetPda,
    vaultAta,
    merchantAta,
    attackerMerchantAta,
  };
}

export function nameBytes(s: string): number[] {
  const buf = Buffer.alloc(32, 0);
  buf.write(s.slice(0, 32));
  return Array.from(buf);
}

export function endpointHash(url: string): number[] {
  return Array.from(createHash("sha256").update(url).digest());
}

/**
 * Canonical x402 payment-request hash matching shared/x402.ts.
 * sha256(method \n url \n merchant_wallet \n merchant_ata \n amount \n category \n nonce \n expires_at)
 */
export function paymentReqHash(parts: {
  method: string;
  url: string;
  merchantWallet: PublicKey;
  merchantAta: PublicKey;
  amountBaseUnits: bigint;
  category: number;
  nonce: bigint;
  requestExpiresAt: number;
}): number[] {
  return Array.from(sharedPaymentReqHash(parts));
}

export function attemptHashPrefix(reasonU8: number, nonce: bigint): number[] {
  const buf = Buffer.alloc(8, 0);
  buf.writeUInt8(reasonU8, 0);
  buf.writeBigUInt64LE(nonce, 0); // overwrite with nonce-le for unique prefix per attempt
  buf.writeUInt8(reasonU8, 7); // tag the last byte with reason for distinguishability
  return Array.from(buf);
}

export const ZERO_HASH: number[] = Array.from(Buffer.alloc(32, 0));
