# Permit402 Submission QA Checklist

Updated: 2026-05-10

## Prompt-To-Artifact Audit

| Requirement | Evidence | Status |
|---|---|---|
| Use AGENTS.md scope | `AGENTS.md` read; active tracks remain Solana Best App, x402 Bonus on Solana, LI.FI Cross-Chain Solana UX. | Done |
| Use local skills / agent skills | Solana, x402, LI.FI, gstack, and Superpowers/GSD skill guidance were used during implementation. | Done |
| Use gstack | `/demo` and `/fund` were opened with `/Users/sourabhkapure/.agents/skills/gstack/browse/dist/browse`; screenshots include `/tmp/permit402-gstack-fund.png` and `/tmp/permit402-gstack-demo-anchor-adapter.png`. | Done locally |
| Use GSD / Superpowers | Remaining-plan docs exist under `docs/superpowers/plans/`; this checklist maps prompt requirements to evidence. | Done locally |
| Preserve teammate pull | `main` is fast-forwarded to `origin/main` and local integration commits sit on top. | Done locally |
| Clean commit history | Local commits are on `main`; `git status -sb` currently shows ahead of origin. | Done locally, not pushed |
| Solana Rust program exists | `programs/permit402` contains Anchor handlers, state, events, errors, and policy logic. | Done locally |
| Anchor build passes | `anchor build --no-idl -- --tools-version v1.52` passed in current environment. | Done locally |
| IDL build passes | `anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts` passed. | Done locally |
| Anchor tests pass | `anchor test --skip-build` passed with 14 tests. | Done locally |
| Latest program deployed to devnet | `docs/submission/program-addresses.md` has an older devnet program ID; latest handler redeploy is not recorded. | Missing |
| Receipt PDA evidence | Sample Receipt fields in `docs/submission/program-addresses.md` are still `_TBD_`. | Missing |
| BlockedAttempt PDA evidence | Sample BlockedAttempt fields in `docs/submission/program-addresses.md` are still `_TBD_`. | Missing |
| x402 facilitator support | `pnpm --filter @permit402/facilitator x402:supported` passed and `docs/submission/x402-facilitator-evidence.md` records current Solana support. | Done for support advertisement |
| x402 settlement mode | Hosted-vs-shim PDA-vault settlement has not been proven. | Missing |
| Keeper memo parsing | `services/keeper` parses/builds `permit402:nonce:<n>:hash:<req_hash_short>` memos and has keeper unit tests. | Done locally |
| Merchant paid retry verification | `services/merchants` still accepts mock `PAYMENT-SIGNATURE`; final Receipt/BlockedAttempt verification is not implemented. | Missing |
| LI.FI route evidence | `pnpm --filter @permit402/web lifi:quote` passed and `/fund` shows live quote data when available. | Done for quote |
| LI.FI execution / devnet mirror | No wallet transaction or devnet mirror funding is recorded. | Missing |
| Web build passes | `pnpm --filter @permit402/web typecheck` and `pnpm --filter @permit402/web build` passed. | Done locally |
| Frontend mode boundary | `apps/web/lib/permit402/adapter.ts` selects mock/localnet/devnet mode; `anchor-adapter.ts` can read a configured PolicyVault plus Receipt/BlockedAttempt accounts from RPC. | Partial |
| Live demo URL | Local dev server works, but no deployed URL is recorded. | Missing |
| Demo video under 3 minutes | `docs/submission/demo-script.md` exists, but no video URL is recorded. | Missing |

## Commands To Re-run Before Submission

On this macOS machine, put Node 20, Solana active release, and cargo Anchor first in PATH before Anchor commands:

```sh
export PATH="/opt/homebrew/opt/node@20/bin:/Users/sourabhkapure/.local/share/solana/install/active_release/bin:/Users/sourabhkapure/.cargo/bin:$PATH"
```

```sh
git status -sb
pnpm lint
pnpm --filter @permit402/shared build
pnpm --filter @permit402/shared typecheck
pnpm --filter @permit402/shared test
anchor build --no-idl -- --tools-version v1.52
anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts
anchor test --skip-build
pnpm --filter @permit402/facilitator smoke
pnpm --filter @permit402/facilitator x402:supported
pnpm --filter @permit402/keeper test
pnpm --filter @permit402/keeper typecheck
pnpm --filter @permit402/web lifi:quote
pnpm --filter @permit402/web typecheck
pnpm --filter @permit402/web build
```

## Final Submission Blockers

1. Redeploy the latest Anchor program to devnet or document why the existing program ID is still current.
2. Produce two real Receipt artifacts and three real BlockedAttempt artifacts with Solscan links.
3. Choose and document final x402 mode: hosted, local shim, or hybrid.
4. Decide whether LI.FI is quote-only for submission or implement the wallet/widget plus devnet mirror path.
5. Fill `docs/submission/program-addresses.md` artifact rows.
6. Add live demo URL and video URL to README/submission docs.
