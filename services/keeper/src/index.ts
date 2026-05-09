import type { BlockReason } from "@permit402/shared";

export interface Permit402Decision {
  kind: "pay" | "block";
  policy: string;
  merchant: string;
  amountBaseUnits: string;
  category: number;
  nonce: string;
  paymentReqHash: string;
  reason?: BlockReason;
}

export function summarizeDecision(decision: Permit402Decision): string {
  if (decision.kind === "pay") {
    return `pay ${decision.amountBaseUnits} to ${decision.merchant} for policy ${decision.policy}`;
  }

  return `block ${decision.amountBaseUnits} to ${decision.merchant} for policy ${decision.policy}: ${decision.reason}`;
}
