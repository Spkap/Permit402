import { PublicKey } from "@solana/web3.js";
import { createHash } from "node:crypto";

export interface PaymentRequestHashInput {
  method: string;
  url: string;
  merchantWallet: string | PublicKey;
  merchantAta: string | PublicKey;
  amountBaseUnits: string | number | bigint;
  category: string | number;
  nonce: string | number | bigint;
  requestExpiresAt: string | number | bigint;
}

const pubkeyToString = (value: string | PublicKey): string =>
  typeof value === "string" ? value : value.toBase58();

const scalarToString = (value: string | number | bigint): string =>
  value.toString();

export function canonicalPaymentRequestMessage(
  input: PaymentRequestHashInput,
): string {
  return [
    input.method,
    input.url,
    pubkeyToString(input.merchantWallet),
    pubkeyToString(input.merchantAta),
    scalarToString(input.amountBaseUnits),
    scalarToString(input.category),
    scalarToString(input.nonce),
    scalarToString(input.requestExpiresAt),
  ].join("\n");
}

export function paymentReqHash(input: PaymentRequestHashInput): Uint8Array {
  return createHash("sha256")
    .update(canonicalPaymentRequestMessage(input))
    .digest();
}

export function paymentReqHashHex(input: PaymentRequestHashInput): string {
  return Buffer.from(paymentReqHash(input)).toString("hex");
}

export function toHex(bytes: Uint8Array | number[]): string {
  return Buffer.from(bytes).toString("hex");
}
