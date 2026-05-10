import { createAnchorPermit402Adapter } from "./anchor-adapter";
import { getMockPermit402Adapter } from "./mock-adapter";

export type Permit402Mode = "mock" | "localnet" | "devnet";

export interface Permit402Receipt {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  nonce: string;
  solscan: string;
}

export interface Permit402BlockedAttempt {
  id: string;
  merchant: string;
  amount: string;
  reason: string;
  nonce: string;
  solscan: string;
}

export interface Permit402PolicyState {
  mode: Permit402Mode;
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
  receipts: Array<Permit402Receipt>;
  blockedAttempts: Array<Permit402BlockedAttempt>;
}

export interface Permit402Adapter {
  mode: Permit402Mode;
  getPolicyState(): Promise<Permit402PolicyState>;
}

export function getPermit402Mode(): Permit402Mode {
  const mode = process.env.NEXT_PUBLIC_PERMIT402_MODE;
  if (mode === "localnet" || mode === "devnet") {
    return mode;
  }

  return "mock";
}

export function getPermit402Adapter(
  mode: Permit402Mode = getPermit402Mode(),
): Permit402Adapter {
  if (mode === "mock") {
    return getMockPermit402Adapter();
  }

  return createAnchorPermit402Adapter({ mode });
}
