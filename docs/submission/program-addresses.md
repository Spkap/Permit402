# Permit402 Program Addresses

## Devnet — LIVE

| Item | Value |
|---|---|
| Program ID | `GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S` |
| Cluster | `https://api.devnet.solana.com` |
| Initial deploy signature | `4wVopRGkm8huZkzLBsvBs8SCAbVpqx5UJDkdG3Li2Agn4vsbJjKzPtrBVQCb2kzGpt6XK1yBpZmivmxVwPKbQbfr` |
| Program Solscan | https://solscan.io/account/GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S?cluster=devnet |
| Deploy tx Solscan | https://solscan.io/tx/4wVopRGkm8huZkzLBsvBs8SCAbVpqx5UJDkdG3Li2Agn4vsbJjKzPtrBVQCb2kzGpt6XK1yBpZmivmxVwPKbQbfr?cluster=devnet |
| Upgrade authority | _local devnet keypair at `~/.config/solana/id.json` (WSL)_ |

## Toolchain pinned

| Tool | Version |
|---|---|
| Anchor | 0.31.1 |
| Solana / Anza CLI | 2.1.21 |
| Platform-tools | v1.52 (rustc 1.85+, edition2024) |
| Build cmd | `anchor build --no-idl -- --tools-version v1.52` |
| Deploy cmd | `solana program deploy target/deploy/permit402.so --program-id target/deploy/permit402-keypair.json --url devnet` |

## Sample artifacts (filled in after Phase 5 implementation)

| Item | Value |
|---|---|
| USDC Mint (devnet) | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| Keeper Authority | _TBD_ |
| Sample Policy Vault PDA | _TBD_ |
| Sample Receipt (paid x402) | _TBD — Solscan tx_ |
| Sample BlockedAttempt (MerchantNotAllowed) | _TBD_ |
| Sample BlockedAttempt (UnauthorizedAgent) | _TBD_ |
| Sample BlockedAttempt (PerCallCapExceeded) | _TBD_ |

> Current state: a devnet program address and initial deploy signature are recorded here. The local instruction handlers have now been filled in, but this file has not yet been updated with a verified redeploy signature or sample Receipt/BlockedAttempt artifacts from the new implementation.
