import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { MerchantCategory, paymentReqHash as sharedPaymentReqHash } from "@permit402/shared";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createHash } from "crypto";

import {
  airdrop,
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

export const usdc = (units: number): bigint => BigInt(units) * 10n ** BigInt(USDC_DECIMALS);

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

export async function bootstrap(programName = "permit402"): Promise<TestContext> {
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

  const usdcMint = await createUsdcMint(provider.connection, admin, admin.publicKey);
  const ownerUsdcAta = await ensureAta(
    provider.connection,
    admin,
    usdcMint,
    owner.publicKey,
  );
  await mintUsdc(provider.connection, admin, usdcMint, admin, ownerUsdcAta, usdc(1000));

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
