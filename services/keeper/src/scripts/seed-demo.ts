import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const PROGRAM_ID = "GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S";
const DEPLOY_SIGNATURE =
  "4wVopRGkm8huZkzLBsvBs8SCAbVpqx5UJDkdG3Li2Agn4vsbJjKzPtrBVQCb2kzGpt6XK1yBpZmivmxVwPKbQbfr";

function solscanAccount(pubkey: string): string {
  return `https://solscan.io/account/${pubkey}?cluster=devnet`;
}

function solscanTx(signature: string): string {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

async function main(): Promise<void> {
  const out = `# Permit402 Program Addresses

## Devnet - LIVE

| Item | Value |
|---|---|
| Program ID | \`${PROGRAM_ID}\` |
| Cluster | \`https://api.devnet.solana.com\` |
| Initial deploy signature | \`${DEPLOY_SIGNATURE}\` |
| Program Solscan | ${solscanAccount(PROGRAM_ID)} |
| Deploy tx Solscan | ${solscanTx(DEPLOY_SIGNATURE)} |
| Upgrade authority | _local devnet keypair at \`~/.config/solana/id.json\` (WSL)_ |

## Toolchain pinned

| Tool | Version |
|---|---|
| Anchor | 0.31.1 |
| Solana / Anza CLI | 2.1.21 |
| Platform-tools | v1.52 (rustc 1.85+, edition2024) |
| Build cmd | \`anchor build --no-idl -- --tools-version v1.52\` |
| Deploy cmd | \`solana program deploy target/deploy/permit402.so --program-id target/deploy/permit402-keypair.json --url devnet\` |

## Sample artifacts

| Item | Value |
|---|---|
| USDC Mint (devnet) | \`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU\` |
| Keeper Authority | _TBD after facilitator key is finalized_ |
| Sample Policy Vault PDA | _TBD after end-to-end seed run_ |
| Sample Receipt (paid x402) | _TBD - Solscan tx_ |
| Sample BlockedAttempt (MerchantNotAllowed) | _TBD_ |
| Sample BlockedAttempt (UnauthorizedAgent) | _TBD_ |
| Sample BlockedAttempt (PerCallCapExceeded) | _TBD_ |

> Current state: program handlers are implemented and build locally. The remaining artifact fields are populated by the first full devnet seed run once the facilitator/keeper key and demo merchants are finalized.
`;

  const outputPath = join(process.cwd(), "docs", "submission", "program-addresses.md");
  await writeFile(outputPath, out);
  console.log(`wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
