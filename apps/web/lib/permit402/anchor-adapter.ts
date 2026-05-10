import { BLOCK_REASON_LABEL, solscanAccountUrl } from "@permit402/shared";
import type { BorshAccountsCoder, Idl } from "@coral-xyz/anchor";
import type { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import type {
  Permit402Adapter,
  Permit402BlockedAttempt,
  Permit402Mode,
  Permit402PolicyState,
  Permit402Receipt,
} from "./adapter";

interface AnchorAdapterOptions {
  mode: Exclude<Permit402Mode, "mock">;
}

interface AnchorAdapterConfig {
  mode: Exclude<Permit402Mode, "mock">;
  programId: string;
  policy: string;
  rpcUrl: string;
}

interface DecodedPolicyVault {
  vaultAta: PublicKey;
  totalCap: unknown;
  totalSpent: unknown;
  dailyCap: unknown;
  spentToday: unknown;
  defaultPerCallCap: unknown;
}

interface DecodedReceipt {
  policy: PublicKey;
  merchant: PublicKey;
  amount: unknown;
  category: number;
  nonce: unknown;
}

interface DecodedBlockedAttempt {
  policy: PublicKey;
  merchant: PublicKey;
  amount: unknown;
  reason: number;
  nonce: unknown;
}

type ProgramAccount = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
};

function readConfig(mode: Exclude<Permit402Mode, "mock">): AnchorAdapterConfig {
  const programId = process.env.NEXT_PUBLIC_PERMIT402_PROGRAM_ID;
  const policy = process.env.NEXT_PUBLIC_PERMIT402_POLICY;
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const missing = [
    ["NEXT_PUBLIC_PERMIT402_PROGRAM_ID", programId],
    ["NEXT_PUBLIC_PERMIT402_POLICY", policy],
    ["NEXT_PUBLIC_SOLANA_RPC_URL", rpcUrl],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      "Missing env for Permit402 " + mode + " adapter: " + missing.join(", "),
    );
  }

  return {
    mode,
    programId: programId as string,
    policy: policy as string,
    rpcUrl: rpcUrl as string,
  };
}

async function loadIdl(): Promise<Idl> {
  const idlModule = await import("../../../../target/idl/permit402.json");
  return ("default" in idlModule ? idlModule.default : idlModule) as Idl;
}

function toBaseUnits(value: unknown): bigint {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    return BigInt(value);
  }
  if (typeof value === "string") {
    return BigInt(value);
  }
  if (value && typeof value === "object" && "toString" in value) {
    return BigInt(value.toString());
  }

  return 0n;
}

function formatUsdc(value: unknown): string {
  const amount = toBaseUnits(value);
  const scale = 1_000_000n;
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(6, "0");
  const trimmed = fraction.replace(/0+$/, "");

  return whole.toString() + (trimmed ? "." + trimmed : "") + " USDC";
}

function remaining(cap: unknown, used: unknown): string {
  const capUnits = toBaseUnits(cap);
  const usedUnits = toBaseUnits(used);

  return formatUsdc(capUnits > usedUnits ? capUnits - usedUnits : 0n);
}

function shortAddress(value: PublicKey): string {
  const address = value.toBase58();
  return address.slice(0, 6) + "..." + address.slice(-4);
}

function samePubkey(left: PublicKey, right: PublicKey): boolean {
  return left.toBase58() === right.toBase58();
}

async function tokenBalance(
  connection: Connection,
  vaultAta: PublicKey,
): Promise<string> {
  try {
    const balance = await connection.getTokenAccountBalance(vaultAta);
    return (
      (balance.value.uiAmountString ?? formatUsdc(balance.value.amount)) +
      " USDC"
    );
  } catch {
    return "unknown USDC";
  }
}

function decodeAccounts<T extends { policy: PublicKey }>(
  accounts: ReadonlyArray<ProgramAccount>,
  coder: BorshAccountsCoder,
  name: string,
  policy: PublicKey,
): Array<{ pubkey: PublicKey; account: T }> {
  const decoded = [];

  for (const { pubkey, account } of accounts) {
    try {
      const item = coder.decode(name, account.data) as T;
      if (samePubkey(item.policy, policy)) {
        decoded.push({ pubkey, account: item });
      }
    } catch {
      // Account discriminator did not match this account type.
    }
  }

  return decoded;
}

function receiptRows(
  receipts: Array<{ pubkey: PublicKey; account: DecodedReceipt }>,
  cluster: Exclude<Permit402Mode, "mock">,
): Array<Permit402Receipt> {
  return receipts.map(({ pubkey, account }) => ({
    id: pubkey.toBase58(),
    merchant: shortAddress(account.merchant),
    amount: formatUsdc(account.amount),
    category: String(account.category),
    nonce: toBaseUnits(account.nonce).toString(),
    solscan: solscanAccountUrl(pubkey.toBase58(), cluster),
  }));
}

function blockedRows(
  blockedAttempts: Array<{ pubkey: PublicKey; account: DecodedBlockedAttempt }>,
  cluster: Exclude<Permit402Mode, "mock">,
): Array<Permit402BlockedAttempt> {
  return blockedAttempts.map(({ pubkey, account }) => {
    const reason = account.reason as keyof typeof BLOCK_REASON_LABEL;

    return {
      id: pubkey.toBase58(),
      merchant: shortAddress(account.merchant),
      amount: formatUsdc(account.amount),
      reason: BLOCK_REASON_LABEL[reason] ?? "UnknownReason",
      nonce: toBaseUnits(account.nonce).toString(),
      solscan: solscanAccountUrl(pubkey.toBase58(), cluster),
    };
  });
}

export function createAnchorPermit402Adapter({
  mode,
}: AnchorAdapterOptions): Permit402Adapter {
  return {
    mode,
    async getPolicyState(): Promise<Permit402PolicyState> {
      const config = readConfig(mode);
      const [{ BorshAccountsCoder }, { Connection, PublicKey }, idl] =
        await Promise.all([
          import("@coral-xyz/anchor"),
          import("@solana/web3.js"),
          loadIdl(),
        ]);
      const connection = new Connection(config.rpcUrl, "confirmed");
      const programId = new PublicKey(config.programId);
      const policyKey = new PublicKey(config.policy);
      const coder = new BorshAccountsCoder(idl);
      const policyInfo = await connection.getAccountInfo(
        policyKey,
        "confirmed",
      );

      if (!policyInfo) {
        throw new Error("Permit402 policy account not found: " + config.policy);
      }

      const policy = coder.decode(
        "PolicyVault",
        policyInfo.data,
      ) as DecodedPolicyVault;
      const programAccounts = await connection.getProgramAccounts(programId);
      const receipts = receiptRows(
        decodeAccounts<DecodedReceipt>(
          programAccounts,
          coder,
          "Receipt",
          policyKey,
        ),
        mode,
      );
      const blockedAttempts = blockedRows(
        decodeAccounts<DecodedBlockedAttempt>(
          programAccounts,
          coder,
          "BlockedAttempt",
          policyKey,
        ),
        mode,
      );
      const observedMerchants = Array.from(
        new Set([...receipts, ...blockedAttempts].map((item) => item.merchant)),
      );

      return {
        mode,
        programId: config.programId,
        policyVault: config.policy,
        vaultBalance: await tokenBalance(connection, policy.vaultAta),
        remainingToday: remaining(policy.dailyCap, policy.spentToday),
        totalCap: formatUsdc(policy.totalCap),
        dailyCap: formatUsdc(policy.dailyCap),
        perCallCap: formatUsdc(policy.defaultPerCallCap),
        merchants: observedMerchants.map((merchant) => ({
          name: merchant,
          category: "observed",
          cap: "read-only",
          status: "Observed",
        })),
        timeline:
          receipts.length + blockedAttempts.length > 0
            ? [
                ...receipts.map((receipt) => ({
                  label: receipt.merchant,
                  status: "paid" as const,
                  detail: "Receipt PDA nonce " + receipt.nonce,
                })),
                ...blockedAttempts.map((attempt) => ({
                  label: attempt.merchant,
                  status: "blocked" as const,
                  detail: attempt.reason + " nonce " + attempt.nonce,
                })),
              ]
            : [
                {
                  label: "policy loaded",
                  status: "ready" as const,
                  detail:
                    "No Receipt or BlockedAttempt accounts found for this policy yet.",
                },
              ],
        receipts,
        blockedAttempts,
      };
    },
  };
}
