import type { BlockReason } from "./block-reason.js";
import type { MerchantCategory } from "./category.js";

export type PubkeyString = string;
export type SignatureString = string;
export type SolscanUrl = string;

export interface PolicyDraft {
  owner: PubkeyString;
  agentAuthority: PubkeyString;
  totalCapUsdc: string;
  dailyCapUsdc: string;
  perCallCapUsdc: string;
  expiresAtUnix: number;
}

export interface PolicySummary extends PolicyDraft {
  policy: PubkeyString;
  vaultAta: PubkeyString;
  usdcMint: PubkeyString;
  totalSpentUsdc: string;
  spentTodayUsdc: string;
  closed: boolean;
}

export interface MerchantConfig {
  id: string;
  displayName: string;
  endpointUrl: string;
  merchantWallet: PubkeyString;
  merchantAta: PubkeyString;
  category: MerchantCategory;
  allowlisted: boolean;
  perMerchantCapUsdc: string;
}

export interface ReceiptView {
  policy: PubkeyString;
  merchant: PubkeyString;
  nonce: string;
  amountUsdc: string;
  category: MerchantCategory;
  paymentReqHash: string;
  txSignature: SignatureString;
  solscanUrl: SolscanUrl;
  createdAtUnix: number;
}

export interface BlockedAttemptView {
  policy: PubkeyString;
  merchant: PubkeyString;
  attemptedAuthority: PubkeyString;
  recorder: PubkeyString;
  nonce: string;
  attemptedAmountUsdc: string;
  category: MerchantCategory;
  reason: BlockReason;
  paymentReqHash: string;
  expectedPaymentReqHash?: string;
  txSignature: SignatureString;
  solscanUrl: SolscanUrl;
  createdAtUnix: number;
}
