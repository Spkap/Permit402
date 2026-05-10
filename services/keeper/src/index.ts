import { BLOCK_REASON_LABEL, type BlockReason } from "@permit402/shared";

const PERMIT402_MEMO_PATTERN =
  /^permit402:nonce:(?<nonce>0|[1-9][0-9]*):hash:(?<hash>[0-9a-fA-F]{8,64})$/;

export interface Permit402Memo {
  raw: string;
  nonce: bigint;
  paymentReqHashPrefix: string;
}

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

  const reason =
    decision.reason === undefined
      ? "UnknownReason"
      : BLOCK_REASON_LABEL[decision.reason];

  return `block ${decision.amountBaseUnits} to ${decision.merchant} for policy ${decision.policy}: ${reason}`;
}

export function parsePermit402Memo(memo: string): Permit402Memo | null {
  const match = PERMIT402_MEMO_PATTERN.exec(memo.trim());
  if (!match?.groups) {
    return null;
  }

  const paymentReqHashPrefix = match.groups.hash.toLowerCase();
  if (paymentReqHashPrefix.length % 2 !== 0) {
    return null;
  }

  return {
    raw: memo,
    nonce: BigInt(match.groups.nonce),
    paymentReqHashPrefix,
  };
}

export function requirePermit402Memo(memo: string): Permit402Memo {
  const parsed = parsePermit402Memo(memo);
  if (!parsed) {
    throw new Error("Invalid Permit402 memo: " + memo);
  }

  return parsed;
}

export function buildPermit402Memo(input: {
  nonce: bigint | number | string;
  paymentReqHashPrefix: string;
}): string {
  const nonce = BigInt(input.nonce);
  if (nonce < 0n) {
    throw new Error("Permit402 memo nonce must be non-negative");
  }

  const paymentReqHashPrefix = input.paymentReqHashPrefix
    .replace(/^0x/i, "")
    .toLowerCase();
  if (
    paymentReqHashPrefix.length < 8 ||
    paymentReqHashPrefix.length > 64 ||
    paymentReqHashPrefix.length % 2 !== 0 ||
    !/^[0-9a-f]+$/.test(paymentReqHashPrefix)
  ) {
    throw new Error("Permit402 memo hash prefix must be 8-64 even hex chars");
  }

  return (
    "permit402:nonce:" + nonce.toString() + ":hash:" + paymentReqHashPrefix
  );
}
