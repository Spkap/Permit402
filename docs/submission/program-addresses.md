# Permit402 Program Addresses

## Devnet — LIVE

| Item | Value |
|---|---|
| Program ID | `GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S` |
| Cluster | `https://api.devnet.solana.com` |
| Initial deploy signature | `4wVopRGkm8huZkzLBsvBs8SCAbVpqx5UJDkdG3Li2Agn4vsbJjKzPtrBVQCb2kzGpt6XK1yBpZmivmxVwPKbQbfr` |
| Program Solscan | https://solscan.io/account/GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S?cluster=devnet |
| Deploy tx Solscan | https://solscan.io/tx/4wVopRGkm8huZkzLBsvBs8SCAbVpqx5UJDkdG3Li2Agn4vsbJjKzPtrBVQCb2kzGpt6XK1yBpZmivmxVwPKbQbfr?cluster=devnet |
| Upgrade authority | `CNsRQSWn25dWAjWKs2eqMPwugJD5EfGaB6mWbQGv78AT` |
| ProgramData Address | `AiTUcdVPjN5drLtUZgmneAjLuZxQK8NqpXCd2JTDM6px` |
| Last verified on devnet | 2026-05-10 via `solana program show ... --url devnet` |
| Last deployed slot | `461082647` |

## Toolchain pinned

| Tool | Version |
|---|---|
| Anchor | 0.31.1 |
| Solana / Anza CLI | 2.1.21 |
| Platform-tools | v1.52 (rustc 1.85+, edition2024) |
| Build cmd | `anchor build --no-idl -- --tools-version v1.52` |
| Deploy cmd | `solana program deploy target/deploy/permit402.so --program-id target/deploy/permit402-keypair.json --url devnet` |

## Redeploy Blocker Found On 2026-05-10

A fresh devnet redeploy was attempted but is currently blocked:

| Check | Result |
|---|---|
| Declared/program-doc ID | `GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S` |
| Local `target/deploy/permit402-keypair.json` ID | `FfBHufHEaC1iTUNk9hD5sYirD8AmMqiizZBjpPLCXAeV` |
| Default local wallet | `AaAe2vaCNbQhV5cZRQ33ECa6P86Jg3TmkQQGBHMdYcjb` |
| Default wallet devnet balance | `0 SOL` |
| Devnet airdrop | Failed due faucet/rate-limit response |
| Existing `GiZNZ...` upgrade authority | `CNsRQSWn25dWAjWKs2eqMPwugJD5EfGaB6mWbQGv78AT` |

To redeploy the existing `GiZNZ...` program ID, the team needs the `GiZNZ...` program keypair and the `CNsR...` upgrade-authority signer funded on devnet. Alternative path: intentionally switch the repo to the available `FfBHuf...` program keypair, rebuild, deploy that new program ID, and update every program-address reference.

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

> Current state: the recorded `GiZNZ...` program exists on devnet, but the latest local handlers have not been redeployed. Sample Receipt/BlockedAttempt artifacts from the new implementation are still missing.
