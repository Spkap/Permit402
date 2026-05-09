import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const SEEDS = {
  CONFIG: Buffer.from("config"),
  POLICY: Buffer.from("policy"),
  AGENT: Buffer.from("agent"),
  MERCHANT: Buffer.from("merchant"),
  MERCHANT_BINDING: Buffer.from("merchant_binding"),
  CATEGORY_BUDGET: Buffer.from("category_budget"),
  RECEIPT: Buffer.from("receipt"),
  BLOCKED: Buffer.from("blocked"),
};

const u64Le = (n: BN | number | bigint): Buffer => {
  const bn = BN.isBN(n) ? n : new BN(n.toString());
  return bn.toArrayLike(Buffer, "le", 8);
};

export function findConfigPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.CONFIG], programId);
}

export function findPolicyPda(
  programId: PublicKey,
  owner: PublicKey,
  policyIndex: BN | number,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.POLICY, owner.toBuffer(), u64Le(policyIndex)],
    programId,
  );
}

export function findAgentAuthorityPda(
  programId: PublicKey,
  policy: PublicKey,
  agent: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.AGENT, policy.toBuffer(), agent.toBuffer()],
    programId,
  );
}

export function findMerchantPda(
  programId: PublicKey,
  merchantWallet: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.MERCHANT, merchantWallet.toBuffer()],
    programId,
  );
}

export function findMerchantBindingPda(
  programId: PublicKey,
  policy: PublicKey,
  merchant: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.MERCHANT_BINDING, policy.toBuffer(), merchant.toBuffer()],
    programId,
  );
}

export function findCategoryBudgetPda(
  programId: PublicKey,
  policy: PublicKey,
  category: number,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.CATEGORY_BUDGET, policy.toBuffer(), Buffer.from([category])],
    programId,
  );
}

export function findReceiptPda(
  programId: PublicKey,
  policy: PublicKey,
  nonce: BN | number,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.RECEIPT, policy.toBuffer(), u64Le(nonce)],
    programId,
  );
}

export function findBlockedAttemptPda(
  programId: PublicKey,
  policy: PublicKey,
  nonce: BN | number,
  attemptHashPrefix: Buffer,
): [PublicKey, number] {
  if (attemptHashPrefix.length !== 8) {
    throw new Error("attemptHashPrefix must be 8 bytes");
  }
  return PublicKey.findProgramAddressSync(
    [SEEDS.BLOCKED, policy.toBuffer(), u64Le(nonce), attemptHashPrefix],
    programId,
  );
}
