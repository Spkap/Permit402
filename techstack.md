# Permit402 Tech Stack

Updated: 2026-05-10

This file records the current implementation stack. Prefer this over older planning notes when a version conflict appears.

## Verified Local Toolchain

| Tool | Version / Value | Evidence |
|---|---|---|
| Anchor CLI | `0.31.1` | `Anchor.toml`, `package.json`, local `anchor --version` |
| Solana / Anza CLI | `2.1.21` | `Anchor.toml`, local active release |
| Platform tools | `v1.52` | `anchor build --no-idl -- --tools-version v1.52` |
| Node for Anchor tests | `20.20.2` | `/opt/homebrew/opt/node@20/bin/node -v` |
| Package manager | `pnpm` workspace | `pnpm-workspace.yaml` |

On this macOS machine, use this PATH before running Anchor commands:

```sh
export PATH="/opt/homebrew/opt/node@20/bin:/Users/sourabhkapure/.local/share/solana/install/active_release/bin:/Users/sourabhkapure/.cargo/bin:$PATH"
```

The Homebrew `anchor` command at `/opt/homebrew/bin/anchor` is the npm stub and is not sufficient for validation. Use the cargo Anchor binary through the PATH above.

## Runtime Packages

| Area | Package / Version | Current use |
|---|---|---|
| Anchor tests/client | `@coral-xyz/anchor@0.31.1` | Anchor tests and web read-only adapter |
| Solana web3 root/tests | `@solana/web3.js@1.95.3` | Anchor tests and shared package |
| Solana web3 web app | `@solana/web3.js@1.98.4` | Web adapter / LI.FI peer compatibility |
| SPL Token | `@solana/spl-token@0.4.8` | Anchor tests |
| Web app | `next@15.1.6`, `react@19.0.0` | `apps/web` |
| UI icons | `lucide-react@0.468.0` | `apps/web` |
| LI.FI SDK | `@lifi/sdk@3.16.3` | Live Base USDC -> Solana USDC route quote |
| LI.FI Widget | `@lifi/widget@3.40.12` | Installed, not executed in final flow yet |
| Services | `hono@4.6.20`, `@hono/node-server@1.13.8` | Merchant and facilitator shims |
| Test runner | `vitest`, `ts-mocha`, `mocha` | Shared/keeper unit tests and Anchor tests |

## x402 Status

| Item | Status |
|---|---|
| `@x402/svm@2.11.0` | Version-checked for the plan, not installed in current package manifests |
| `@x402/core@2.11.0` | Version-checked for the plan, not installed in current package manifests |
| Hosted facilitator support | Verified with `pnpm --filter @permit402/facilitator x402:supported` |
| PDA-vault settlement | Not proven yet |
| Current local flow | Merchant/facilitator shim plus Permit402 policy checks/tests |

Do not claim hosted x402 settlement from the Permit402 PDA vault until the hosted-vs-shim spike is executed and recorded.

## LI.FI Status

| Item | Status |
|---|---|
| SDK quote | Implemented and verified with `pnpm --filter @permit402/web lifi:quote` |
| Widget execution | Installed but not wired/executed as final funding flow |
| Devnet mirror | Not implemented |
| Safe claim | Live route quote evidence only |

## Validation Commands

```sh
pnpm lint
pnpm --filter @permit402/shared build
pnpm --filter @permit402/shared typecheck
pnpm --filter @permit402/shared test
pnpm --filter @permit402/merchants smoke
pnpm --filter @permit402/facilitator smoke
pnpm --filter @permit402/facilitator x402:supported
pnpm --filter @permit402/keeper test
pnpm --filter @permit402/keeper typecheck
pnpm --filter @permit402/web lifi:quote
pnpm --filter @permit402/web typecheck
pnpm --filter @permit402/web build
anchor build --no-idl -- --tools-version v1.52
anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts
anchor test --skip-build
```

## Known Version Drift

Older planning docs mention Anchor `0.32.1` and `@solana/kit@6.9.0`. The current codebase is verified on Anchor `0.31.1` and does not currently use `@solana/kit`. Upgrade only if there is enough time to repeat build, IDL, tests, and demo validation.
