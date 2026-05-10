# Permit402 Implementation Map

Source plan: docs/superpowers/plans/2026-05-09-permit402-implementation-plan.md

Generated on: 2026-05-09

## Objective Restatement

Map the locked Permit402 implementation plan against the actual repository state, preserve work already done, and continue with the next concrete implementation work needed to move the project toward the hackathon demo.

Concrete success criteria from the plan:

- Anchor/Rust Solana program with real policy enforcement.
- Devnet deployment and program ID evidence.
- Public README/setup/submission docs.
- Visible demo with policy creation, LI.FI route/funding, two successful x402 payments, three on-chain blocked attempts, and Solscan links.
- Frontend, merchant/x402 flow, facilitator/keeper, LI.FI funding surface, and shared adapter contract.
- Validation evidence: Anchor build/test, frontend typecheck/build, merchant server, demo agent, real Receipt and BlockedAttempt accounts.

## Current Repo Snapshot

Implemented files present:

- Anchor scaffold: Anchor.toml, Cargo.toml, programs/permit402.
- Program state: Config, PolicyVault, AgentAuthority, Merchant, MerchantBinding, CategoryBudget, Receipt, BlockedAttempt.
- Program instruction files for config, policy, funding, merchant allowlist, x402 payment, blocked attempt recording, close/revoke.
- Test helpers: tests/helpers/fixtures.ts, pda.ts, token.ts.
- Test specs: tests/permit402_policy.spec.ts, tests/permit402_rejections.spec.ts, tests/permit402_replay.spec.ts.
- Submission placeholder: docs/submission/program-addresses.md.

Missing or still incomplete top-level areas:

- services/agent, services/facilitator, services/keeper, services/mirror.
- docs/submission/demo-script.md and qa-checklist.md.
- live demo URL, demo video URL, redeploy/sample-account evidence for the latest implementation, real Receipt/BlockedAttempt Solscan artifact links.

## Plan Phase Map

| Plan item | Current evidence | Status |
|---|---|---|
| Phase 0: pnpm workspace | pnpm-workspace.yaml exists with apps, services, packages globs; pnpm install completed and produced pnpm-lock.yaml. | Present |
| Phase 0: shared contract/types | packages/permit402-shared exists with BlockReason, category, policy/receipt/blocked types, Solscan helpers, and x402 hash helper. | Present |
| Phase 0: canonical x402 hash helper | packages/permit402-shared/src/x402.ts exports paymentReqHash and has a fixture test. tests/helpers/fixtures.ts still has a duplicate helper pending migration. | Partial |
| Phase 0: track-fit doc | docs/submission/track-fit.md was added in this pass with current Solana/x402/LI.FI evidence. | Present |
| Phase 1: x402 package install | Hono and @hono/node-server are installed for the merchant/facilitator shims. @x402/core/@x402/svm are version-checked in docs but not installed in the current package manifests. | Partial |
| Phase 1: merchant server and demo agent | services/merchants exists with /health, /research, /translate, /attacker and a passing smoke test. Paid retry verifies the mock signature against paymentReqHash. services/agent exists and produces two paid + three blocked mock-local results against the merchant server. | Partial |
| Phase 1: hosted/fallback x402 mode evidence | docs/submission/x402-facilitator-evidence.md records current hosted facilitator support. Hosted PDA-vault settlement spike is still not done. | Partial |
| Phase 2: Next.js frontend/mock adapter | apps/web exists with /demo, /dashboard, /policy, /fund, MockPermit402 state, and passing typecheck/build. gstack loaded /demo and saved /tmp/permit402-demo-mobile.png. | Partial |
| Phase 3: LI.FI funding surface | @lifi/sdk@3.16.3 and @lifi/widget@3.40.12 are installed in apps/web. /fund now fetches a live Base USDC -> Solana USDC SDK route quote when available; widget execution and mirror service are still missing. | Partial |
| Phase 4: Anchor scaffold | Anchor.toml, Cargo.toml, programs/permit402 exist. | Present |
| Phase 4: state structs and events | programs/permit402/src/state and events.rs exist. | Present |
| Phase 4: PDA/token helpers | tests/helpers/pda.ts and token.ts exist. | Present |
| Phase 4: tests | policy/rejections/replay specs exist; TODO placeholders were replaced with real protocol assertions. | Present |
| Phase 5: init_config | Implemented in this pass. | Implemented, unverified |
| Phase 5: create_policy | Implemented in this pass. | Implemented, unverified |
| Phase 5: fund_policy | Implemented in this pass. | Implemented, unverified |
| Phase 5: register_merchant | Implemented in this pass. | Implemented, unverified |
| Phase 5: add_merchant | Implemented in this pass. | Implemented, unverified |
| Phase 5: revoke_merchant | Implemented in this pass. | Implemented, unverified |
| Phase 5: set_category_budget | Implemented in this pass. | Implemented, unverified |
| Phase 5: classify_attempt helper | Implemented as classify_loaded_attempt in pay_x402.rs and reused by record_blocked_attempt. | Implemented, unverified |
| Phase 5: pay_x402 | Implemented in this pass: checks policy, transfers USDC from PDA vault, updates spend counters, writes Receipt, emits X402Paid. | Implemented, unverified |
| Phase 5: record_blocked_attempt | Implemented in this pass: recorder rules, policy reclassification, keeper-only mismatch, writes BlockedAttempt, emits X402Blocked. | Implemented, unverified |
| Phase 5: close_policy | Implemented in this pass: owner sweep from PDA vault ATA to owner ATA and marks policy closed. | Implemented, verified locally |
| Phase 5: Anchor build/test | Toolchain installed/exposed locally; build, IDL generation, and tests pass with pinned paths. | Verified locally |
| Phase 5: IDL/devnet deploy/program-address docs | docs/submission/program-addresses.md records a devnet program ID and initial deploy signature, but no redeploy/sample artifacts for the new local handlers. | Partial |
| Phase 6: Anchor adapter integration | apps/web exists with mock adapter, route surfaces, and mock/localnet/devnet adapter boundary files. The read-only Anchor account reader can load a configured PolicyVault plus matching Receipt/BlockedAttempt accounts; write actions are still missing. | Partial |
| Phase 7: keeper/facilitator hardening | services/keeper, services/facilitator, services/merchants, and services/agent exist. Keeper memo parsing/building is implemented and tested, but services are still shim/mock-local and do not create real on-chain artifacts. | Partial |
| Phase 8: submission readiness | README has project overview but not final live app/video/current devnet artifact evidence. | Partial |

## Completion Gate Audit

| Gate from plan §21 | Evidence inspected | Result |
|---|---|---|
| anchor test passes | `anchor test --skip-build` passed: 14 passing tests after the close-policy and expired-request coverage. | Achieved locally |
| anchor build passes | `anchor build --no-idl -- --tools-version v1.52` passed. `anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts` passed. | Achieved locally |
| program deployed to devnet | docs/submission/program-addresses.md records a devnet program ID and initial deploy signature. No redeploy was run for the new local implementation in this pass. | Partial |
| program ID recorded in README | README describes target tracks but does not include the devnet deployment table. Anchor.toml/lib.rs and docs/submission/program-addresses.md contain GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S. | Partial |
| frontend typecheck/build passes | pnpm --filter @permit402/web typecheck and build passed. | Achieved for mock frontend |
| merchant server starts | services/merchants smoke test passed against the Hono app. | Achieved for challenge-only merchant |
| demo agent can trigger two payments and three blocks | pnpm --filter @permit402/agent demo produced two paid and three blocked mock-local steps against services/merchants. Real on-chain artifacts are still pending. | Partial |
| at least two real Receipt accounts exist | No live/local validated accounts produced in this pass. | Not achieved |
| at least three real BlockedAttempt accounts exist | No live/local validated accounts produced in this pass. | Not achieved |
| Solscan links open | No Solscan links recorded. | Not achieved |
| LI.FI route/quote/widget evidence exists | /fund shows a live LI.FI SDK route quote when available; `pnpm --filter @permit402/web lifi:quote` passed and docs/submission/lifi-route-evidence.md records evidence. Widget execution and devnet mirror are still pending. | Partial |
| x402 mode documented truthfully | docs/submission/track-fit.md records facilitator support and explicitly does not claim PDA-vault hosted settlement. | Partial |
| README has setup instructions | README has overview/read-order/stack/build-gate, not full final setup. | Partial |
| video under 3 minutes | No video artifact. | Not achieved |
| live demo URL works | No live demo URL. | Not achieved |

## Work Completed In This Mapping Pass

Implemented the next concrete protocol slice in programs/permit402/src/instructions:

- init_config persists admin, USDC mint, keeper authority, fee bps, and bump.
- create_policy validates caps/expiry, initializes PolicyVault, AgentAuthority, vault ATA metadata, and spend counters.
- fund_policy transfers SPL tokens from owner ATA into the PDA-owned vault ATA.
- register_merchant initializes merchant identity, endpoint hash, category, and merchant ATA.
- add_merchant initializes or updates MerchantBinding with allowlist caps.
- revoke_merchant flips MerchantBinding.allowed to false.
- set_category_budget initializes or updates CategoryBudget.
- pay_x402 validates authorization and policy, performs PDA-signed token transfer, updates spend counters, writes Receipt, and emits X402Paid.
- record_blocked_attempt recomputes block reason, enforces recorder/keeper rules, writes BlockedAttempt, and emits X402Blocked.

## Important Remaining Risks

- Rust/Anchor compilation is now verified locally using the pinned Solana 2.1.21 toolchain path and Anchor 0.31.1.
- The test fixture now creates full policy/merchant state for rejection and replay tests.
- tests/permit402_rejections.spec.ts and tests/permit402_replay.spec.ts no longer contain expect.fail TODO placeholders.
- close_policy is implemented and covered by the build. A dedicated close_policy behavior test is still recommended.
- Anchor.toml/package.json currently pin Anchor 0.31.1, while the plan says 0.32.1.
- The frontend/x402/LI.FI/shared-package/service portions of the plan are not started in this repo.

## Recommended Next Actions

1. Add a focused close_policy behavior test.
2. Decide whether to keep Anchor 0.31.1 as verified or upgrade to 0.32.1 and repeat build/test.
3. Redeploy latest verified handlers to devnet and update docs/submission/program-addresses.md with fresh artifacts.
4. Start shared package, x402 services, frontend mock demo, and LI.FI funding lanes.
