import {
  createAssociatedTokenAccountIdempotent,
  createMint,
  getAssociatedTokenAddressSync,
  mintTo,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
} from "@solana/web3.js";

export const USDC_DECIMALS = 6;

export async function airdrop(
  connection: Connection,
  to: PublicKey,
  sol: number,
): Promise<void> {
  const sig = await connection.requestAirdrop(to, sol * 1_000_000_000);
  await connection.confirmTransaction(sig, "confirmed");
}

export async function createUsdcMint(
  connection: Connection,
  payer: Signer,
  authority: PublicKey,
): Promise<PublicKey> {
  return createMint(connection, payer, authority, null, USDC_DECIMALS);
}

export async function ensureAta(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
): Promise<PublicKey> {
  return createAssociatedTokenAccountIdempotent(
    connection,
    payer,
    mint,
    owner,
    undefined,
    undefined,
    undefined,
    allowOwnerOffCurve,
  );
}

export function ata(mint: PublicKey, owner: PublicKey, allowOffCurve = false): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner, allowOffCurve);
}

export async function mintUsdc(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  authority: Keypair,
  destination: PublicKey,
  amount: bigint,
): Promise<void> {
  await mintTo(connection, payer, mint, destination, authority, amount);
}
