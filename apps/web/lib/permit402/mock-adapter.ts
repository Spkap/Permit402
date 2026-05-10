import {
  BLOCK_REASON,
  BLOCK_REASON_LABEL,
  CATEGORY,
} from "@permit402/shared/policy";
import { solscanAccountUrl } from "@permit402/shared/solscan";

export interface MockReceipt {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  nonce: string;
  solscan: string;
}

export interface MockBlockedAttempt {
  id: string;
  merchant: string;
  amount: string;
  reason: string;
  nonce: string;
  solscan: string;
}

export interface MockPolicyState {
  programId: string;
  policyVault: string;
  vaultBalance: string;
  remainingToday: string;
  totalCap: string;
  dailyCap: string;
  perCallCap: string;
  merchants: Array<{
    name: string;
    category: string;
    cap: string;
    status: string;
  }>;
  timeline: Array<{
    label: string;
    status: "paid" | "blocked" | "ready";
    detail: string;
  }>;
  receipts: Array<MockReceipt>;
  blockedAttempts: Array<MockBlockedAttempt>;
}

const programId = "GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S";
const policyVault = "Permit402PolicyVault111111111111111111111111";

export function getMockPolicyState(): MockPolicyState {
  return {
    programId,
    policyVault,
    vaultBalance: "200.00 USDC",
    remainingToday: "95.00 USDC",
    totalCap: "500.00 USDC",
    dailyCap: "100.00 USDC",
    perCallCap: "10.00 USDC",
    merchants: [
      {
        name: "research.api",
        category: "Research",
        cap: "5.00 USDC/call",
        status: "Allowed",
      },
      {
        name: "translate.api",
        category: "Translate",
        cap: "3.00 USDC/call",
        status: "Allowed",
      },
      {
        name: "attacker.api",
        category: "Research",
        cap: "0.00 USDC",
        status: "Blocked",
      },
    ],
    timeline: [
      {
        label: "research.api",
        status: "paid",
        detail: "HTTP 402 -> Permit402 pay_x402 -> Receipt PDA #1",
      },
      {
        label: "translate.api",
        status: "paid",
        detail: "HTTP 402 -> Permit402 pay_x402 -> Receipt PDA #2",
      },
      {
        label: "attacker.api",
        status: "blocked",
        detail: BLOCK_REASON_LABEL[BLOCK_REASON.MerchantNotAllowed],
      },
      {
        label: "replay",
        status: "blocked",
        detail: BLOCK_REASON_LABEL[BLOCK_REASON.ReceiptAlreadyExists],
      },
      {
        label: "over cap",
        status: "blocked",
        detail: BLOCK_REASON_LABEL[BLOCK_REASON.PerCallCapExceeded],
      },
    ],
    receipts: [
      {
        id: "receipt-1",
        merchant: "research.api",
        amount: "2.00 USDC",
        category: String(CATEGORY.RESEARCH),
        nonce: "1",
        solscan: solscanAccountUrl(programId),
      },
      {
        id: "receipt-2",
        merchant: "translate.api",
        amount: "1.00 USDC",
        category: String(CATEGORY.TRANSLATE),
        nonce: "2",
        solscan: solscanAccountUrl(programId),
      },
    ],
    blockedAttempts: [
      {
        id: "block-1",
        merchant: "attacker.api",
        amount: "4.00 USDC",
        reason: "MerchantNotAllowed",
        nonce: "101",
        solscan: solscanAccountUrl(programId),
      },
      {
        id: "block-2",
        merchant: "research.api",
        amount: "2.00 USDC",
        reason: "ReceiptAlreadyExists",
        nonce: "1",
        solscan: solscanAccountUrl(programId),
      },
      {
        id: "block-3",
        merchant: "research.api",
        amount: "12.00 USDC",
        reason: "PerCallCapExceeded",
        nonce: "102",
        solscan: solscanAccountUrl(programId),
      },
    ],
  };
}
