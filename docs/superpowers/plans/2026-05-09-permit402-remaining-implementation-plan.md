# Permit402 Remaining Implementation Plan

> Superseded for submission planning by
> docs/superpowers/plans/2026-05-10-permit402-submission-remaining-plan.md.
> This file is kept as historical implementation context from 2026-05-09.

Source inputs:
- AGENTS.md
- docs/superpowers/plans/2026-05-09-permit402-implementation-map.md
- docs/superpowers/plans/2026-05-09-permit402-implementation-plan.md
- docs/submission/track-fit.md
- current repo files as of 2026-05-09

## 0. Goal

Finish the remaining Permit402 implementation without redoing completed work.

The target is a judge-ready hackathon demo where:

- the Anchor program enforces Permit402 policy from a PDA-owned USDC vault;
- two successful x402 payments create Receipt PDAs;
- at least three rejected attempts create BlockedAttempt PDAs;
- the app shows policy, vault balance, remaining budget, receipts, blocks, and Solscan links;
- x402 is a real HTTP 402 paid API flow, with the exact hosted/shim mode documented honestly;
- LI.FI is used for a real route/quote/widget/funding flow into the Solana experience;
- devnet program ID, sample accounts, README setup, live demo URL, and <3 minute video are ready.

## 1. Current Truth

Already present:

- Anchor scaffold and program modules under programs/permit402.
- State structs for Config, PolicyVault, AgentAuthority, Merchant, MerchantBinding, CategoryBudget, Receipt, BlockedAttempt.
- Event structs for X402Paid and X402Blocked.
- PDA and token test helpers.
- Partial tests.
- Local handler implementations for most Phase 5 instructions.
- pnpm workspace scaffold.
- packages/permit402-shared with policy constants, x402 hash helper, Solscan helpers, and a passing fixture test.
- services/merchants with challenge-only Hono endpoints and a passing smoke test.
- apps/web with mock /demo, /dashboard, /policy, /fund routes and passing typecheck/build.
- docs/submission/program-addresses.md with an existing devnet program ID and deploy signature.
- docs/submission/track-fit.md with current npm/facilitator evidence.

Still not done:

- Dedicated close_policy behavior test.
- Fresh devnet redeploy of latest handlers.
- Anchor adapter and real-program frontend mode.
- x402 facilitator/demo-agent services and real settlement/proof handling.
- LI.FI widget/route/mirror flow.
- Anchor adapter/IDL integration.
- README final submission details.
- Demo video and live URL.

## 2. Skill And Tool Routing

Use these skill lanes deliberately:

| Lane | Primary skills/tools | Use for |
|---|---|---|
| Protocol | solana-dev-skill, solana-anchor-claude-skill, solana-security, vulnhunter | Anchor compile fixes, PDA/CPI correctness, tests, devnet deploy, security pass |
| x402 | x402, quicknode if RPC/facilitator infra is needed | Merchant 402 responses, payment headers, hosted-vs-shim decision, paid API flow |
| LI.FI | li-fi-api, li-fi-sdk, lifi-widget, lifi-solana-ecosystem, lifi-brand-guidelines | Route/quote/widget, supported-chain verification, mirror documentation |
| Wallet/UI | phantom-connect, solana-web3js only at legacy boundaries, solana-kit for new TS client code, frontend-design, senior-frontend | Phantom wallet, Next.js app, dashboard/demo UX |
| QA | gstack, Browser, Playwright/browser checks | Local app dogfooding, responsive screenshots, demo flow verification |
| Planning/review | gsd planner/checker/verifier style, superpowers executing-plans/checklists, gstack autoplan review | Phase gating, completion audit, risk review, no false completion claims |
| Submission | docs writer/checklist style, repo instructions | README, track-fit, program-addresses, demo script, QA checklist |

Do not use ZK/compression skills on the critical path. Light Protocol, Arcium, private payments, Swig, v0, ElevenLabs, Solana Mobile, Virtuals, NoahAI remain future work unless explicitly reopened.

## 3. Execution Order

The fastest safe path is four lanes, with hard gates.

### Lane A: Protocol Must Become Real First

Owner: protocol/backend worker.

Files:
- programs/permit402/src/**
- tests/**
- Anchor.toml
- package.json only if toolchain dependency changes are necessary
- docs/submission/program-addresses.md after redeploy

Tasks:

1. Restore or install toolchain access.
   - Verify commands:
     - which rustc
     - which cargo
     - which anchor
     - anchor --version
     - solana --version
   - If this Mac cannot compile, use the environment that produced docs/submission/program-addresses.md, but record that route in program-addresses.md.

2. Resolve the Anchor version truth before deeper implementation.
   - Current repo evidence: Anchor.toml/package.json use 0.31.1.
   - Locked plan evidence: implementation plan says Anchor 0.32.1.
   - Choose one deliberately:
     - upgrade repo to 0.32.1 if toolchain supports it; or
     - keep 0.31.1 and update docs/submission/track-fit.md plus README to state the actual verified version.
   - Do not leave docs and package config disagreeing.

3. Compile current handlers.
   - Run anchor build.
   - Fix all Rust/Anchor errors from the current implementation.
   - Confirm PDA signer seeds, account constraints, unchecked account deserialization, and SPL token CPI behavior.

4. Implement close_policy or remove it from MVP surface.
   - Preferred: implement close_policy to transfer remaining vault funds to owner ATA and mark policy closed.
   - Add or update a focused test.

5. Consolidate test fixtures.
   - Create a helper that initializes config, policy, funding, merchant registration, allowlist, and category budget per suite/test.
   - Do not rely on spec file execution order.

6. Replace all test placeholders.
   - PerCallCapExceeded.
   - PaymentRequestHashMismatch keeper-only success.
   - PaymentRequestHashMismatch non-keeper rejection.
   - AttemptWouldPass rejection.
   - Replay: duplicate nonce fails through Receipt PDA collision.
   - Replay: same nonce can still create a BlockedAttempt with a different attempt_hash_prefix.

7. Expand policy coverage to the plan's core checks.
   - approved agent_authority.
   - merchant allowlist.
   - per-call cap.
   - per-merchant cap.
   - category cap.
   - total cap.
   - daily cap.
   - policy expiry.
   - nonce replay guard.
   - x402 payment_req_hash binding.

8. Run protocol gate.
   - yarn lint:fix or prettier for tests.
   - anchor build.
   - anchor test.
   - Optional but recommended: solana-security/vulnhunter review of Anchor account constraints and CPI signer authority.

9. Redeploy latest verified program to devnet.
   - Deploy only after local build/test is green.
   - Update docs/submission/program-addresses.md with:
     - new deploy/upgrade signature;
     - program ID;
     - USDC mint;
     - keeper authority;
     - sample policy vault;
     - at least two Receipt artifacts;
     - at least three BlockedAttempt artifacts;
     - Solscan links.

Exit gate for Lane A:
- anchor build passes.
- anchor test passes.
- Latest implementation is deployed or the plan explicitly says deploy is still pending.
- docs/submission/program-addresses.md reflects only verified facts.

### Lane B: Shared Contract And x402 Merchant Flow

Owner: frontend/x402 worker, can run in parallel after shared type shape is agreed; final integration waits for Lane A IDL.

Files:
- pnpm-workspace.yaml
- package.json
- packages/permit402-shared/src/**
- services/merchants/src/**
- services/facilitator/src/**
- services/agent/src/**
- apps/web/lib/x402/**
- docs/submission/track-fit.md

Tasks:

1. Convert repo to planned workspace shape without breaking Anchor.
   - Add pnpm-workspace.yaml for apps, services, packages.
   - Keep existing Anchor/yarn path working until explicitly migrated.
   - If switching to pnpm, document commands and update README. Avoid half-migrated lockfile confusion.

2. Create packages/permit402-shared.
   - BlockReason enum in exact Rust order.
   - Category enum.
   - Policy/cap/merchant/receipt/blocked attempt types.
   - canonical paymentReqHash helper.
   - Solscan URL helpers.
   - Unit tests for paymentReqHash fixture compatibility with tests/helpers/fixtures.ts.

3. Build merchant server.
   - Hono server with:
     - GET /health
     - GET /research
     - GET /translate
     - GET /attacker or malicious challenge endpoint
   - First request returns HTTP 402 with PAYMENT-REQUIRED.
   - Paid retry validates proof/receipt through final selected mode.
   - Clear JSON responses for allowed and blocked cases.

4. Build x402 mode spike.
   - Test hosted exact SVM with normal keypair source ATA.
   - Test whether hosted exact can settle or verify the Permit402 PDA-vault path.
   - Record result in docs/submission/track-fit.md:
     - hosted_exact, shim, or hybrid;
     - what was verified;
     - what is not being claimed.

5. Implement facilitator shim if required.
   - Validate merchant identity, policy, nonce, expiry, amount, category, payment_req_hash.
   - Preflight policy before irreversible transfer.
   - Call pay_x402 for allowed attempts.
   - Call record_blocked_attempt for blocked attempts.
   - Add duplicate request cache keyed by policy + nonce + payment_req_hash.

6. Build demo agent.
   - services/agent/src/run-demo.ts triggers:
     - research success;
     - translate success;
     - attacker merchant block;
     - replay block;
     - over-cap block.
   - Print Solscan/account links when running against devnet.
   - Add smoke script that starts merchants and observes at least two 402 challenges.

Exit gate for Lane B:
- Merchant server starts.
- Demo agent can produce the 2 success + 3 block script in mock/local mode.
- x402 mode is documented truthfully.
- No claim that hosted PDA-vault settlement works unless proven.

### Lane C: Frontend And LI.FI Funding UX

Owner: frontend worker.

Files:
- apps/web/**
- packages/permit402-shared/**
- services/mirror/src/**
- docs/submission/track-fit.md

Tasks:

1. Scaffold Next.js 15 app under apps/web.
   - Tailwind 4.
   - Phantom wallet connection.
   - No landing page: /demo should be the useful first screen.
   - Maintain a quiet operational dashboard style, not marketing hero layout.

2. Implement adapter boundary.
   - apps/web/lib/permit402/adapter.ts
   - mock-adapter.ts for immediate demo.
   - anchor-adapter.ts after IDL is available.
   - pda.ts for client PDA derivations.
   - Environment switch: mock, localnet, devnet.

3. Build main demo pages.
   - /demo: timeline runner, current policy, vault balance, remaining budgets, active attempt status.
   - /policy: create/edit policy form.
   - /fund: LI.FI funding panel and mirror status.
   - /dashboard: receipts, blocked attempts, merchant allowlist, Solscan links.

4. Build components.
   - BudgetMeter.
   - MerchantTable.
   - ReceiptList.
   - BlockedAttemptList.
   - DemoRunner.
   - SolscanLink.
   - LifiFundingPanel.

5. LI.FI integration.
   - Use lifi-widget for fast route UX unless custom route preview is more reliable.
   - Use li-fi-api or SDK for route preview fallback.
   - Verify Solana route discovery at runtime.
   - Show source chain, destination chain, token, tool, estimated output, and status.
   - Build mirror service that can credit devnet USDC after route confirmation or rehearsal trigger.
   - Document exactly what is live route evidence and what is devnet mirror behavior.

6. Anchor adapter integration.
   - Import generated IDL or client after Lane A.
   - Implement getPolicy, createPolicy, listMerchants, payX402, recordBlockedAttempt, receipt/blocked account fetching.
   - Run demo in mock mode, local validator mode, then devnet mode.

7. Frontend QA.
   - pnpm typecheck.
   - pnpm build.
   - Start local dev server.
   - Use gstack/browser checks:
     - desktop /demo.
     - mobile /demo.
     - /fund route states.
     - /dashboard no overlap and Solscan links visible.
   - Capture screenshots for submission/QA if useful.

Exit gate for Lane C:
- Mock demo works without backend.
- Anchor/devnet mode works after Lane A/B.
- LI.FI route/quote/widget evidence exists.
- Frontend typecheck/build pass.
- Browser/gstack verification completed.

### Lane D: Submission And Demo Readiness

Owner: integrator/release worker. Start docs early, finalize after verified artifacts.

Files:
- README.md
- docs/submission/demo-script.md
- docs/submission/program-addresses.md
- docs/submission/track-fit.md
- docs/submission/qa-checklist.md

Tasks:

1. README.
   - Project name and one-line description.
   - Setup instructions.
   - Program ID and Solscan link.
   - Live demo URL.
   - Demo video URL.
   - Exact x402 mode.
   - Exact LI.FI integration.
   - Known limitations.
   - Do not overclaim devnet/latest deploy/test status.

2. Demo script.
   - Keep under 3 minutes.
   - Must show:
     - policy creation;
     - LI.FI funding/route or mirror explanation;
     - two successful x402 payments;
     - three blocked attempts;
     - dashboard with receipts, blocked attempts, balance, remaining budget, program ID.

3. QA checklist.
   - Turn plan §21 into a checked artifact with command output references.
   - Include browser/gstack screenshots or links if generated.
   - Include exact validation commands and pass/fail status.

4. Final rehearsal.
   - Clean browser session.
   - Fresh devnet accounts where practical.
   - Pre-warmed LI.FI route or documented fallback.
   - Verify all Solscan links open.
   - Verify live URL works.
   - Record video under 3 minutes.

Exit gate for Lane D:
- README and submission docs are accurate.
- Video is under 3 minutes.
- Live demo URL works.
- Every judge-visible claim has evidence.

## 4. Parallelization Plan

Run these in parallel after a 15 minute coordination sync:

| Worker | Ownership | Must not touch |
|---|---|---|
| Worker A: Protocol | programs/permit402, tests, deploy docs | apps/web except generated IDL handoff |
| Worker B: x402/services/shared | packages/permit402-shared, services/merchants, services/facilitator, services/agent, apps/web/lib/x402 | Anchor handlers unless shared contract requires coordination |
| Worker C: Frontend/LI.FI | apps/web, apps/web/lib/lifi, services/mirror | programs/permit402 |
| Worker D: Submission/QA | README, docs/submission, demo script, QA checklist | Product code except typo fixes |

Rules:
- Everyone must assume others are editing the repo.
- Do not revert edits made by others.
- Shared package changes require quick review because they affect every lane.
- Anchor IDL is the handoff from Worker A to Worker C/B.
- If the deployed IDL differs from frontend assumptions, update shared types first.

## 5. Milestones

### Milestone 1: Protocol Green
Deliverables:
- close_policy implemented.
- all placeholder tests replaced.
- anchor build/test green locally.
- latest devnet deploy or explicit deploy blocker.

Validation:
- anchor build --no-idl -- --tools-version v1.52
- anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts
- anchor test --skip-build
- docs/submission/program-addresses.md updated with verified status.

### Milestone 2: Mock Product Demo
Deliverables:
- shared package.
- merchant server returning 402.
- demo agent in mock mode.
- Next.js /demo, /policy, /fund, /dashboard using MockPermit402Adapter.

Validation:
- package tests/typecheck.
- merchant smoke script.
- frontend build.
- gstack/browser local demo check.

### Milestone 3: Real Integration
Deliverables:
- IDL imported.
- Anchor adapter.
- facilitator/keeper path finalized.
- demo agent creates real local/devnet Receipt and BlockedAttempt accounts.

Validation:
- local validator demo.
- devnet demo.
- Solscan links.

### Milestone 4: Submission Ready
Deliverables:
- README final.
- track-fit final.
- program-addresses final.
- demo-script final.
- qa-checklist final.
- live URL.
- video under 3 minutes.

Validation:
- clean-browser rehearsal.
- fresh-account rehearsal where possible.
- all plan §21 gates checked.

## 6. Non-Negotiable Completion Gates

Do not call the project done until all are true or explicitly documented as blockers:

- anchor build passes.
- anchor test passes.
- latest program implementation is deployed to devnet.
- README contains verified program ID and setup instructions.
- frontend typecheck passes.
- frontend build passes.
- merchant server starts.
- demo agent triggers two payments and three blocks.
- at least two real Receipt accounts exist.
- at least three real BlockedAttempt accounts exist.
- Solscan links open.
- LI.FI route/quote/widget evidence exists.
- x402 mode is documented truthfully.
- video is under 3 minutes.
- live demo URL works.

## 7. Immediate Next Command Sequence

Use this order from repo root:

```sh
git status --short
which rustc || true
which cargo || true
which anchor || true
which solana || true
yarn lint:fix
anchor build
anchor test
```

If anchor/cargo are missing, stop Protocol Lane execution and fix toolchain first. Do not continue building on top of uncompiled Rust.

After toolchain is available and protocol is green:

```sh
npm view @x402/svm version
npm view @x402/core version
npm view @lifi/sdk version
npm view @lifi/widget version
curl -fsSL https://x402.org/facilitator/supported
```

Then scaffold the workspace/shared package and services.

## 8. Prompt-To-Artifact Audit

| User requirement | Artifact/evidence in this plan |
|---|---|
| Check implementation-map.md | Sections 1, 3, and 6 are derived from map status and completion gates. |
| Check AGENTS.md | Sections 0, 2, 3, 6 enforce Solana/x402/LI.FI scope and no-overclaim rules. |
| Make a really good plan | This document gives lanes, tasks, gates, sequencing, ownership, commands, and evidence. |
| Use gstack | Sections 2 and 3 route frontend/demo QA through gstack/browser checks. |
| Use agent skills | Section 2 maps Solana, x402, LI.FI, Phantom, QA, and security skills to work lanes. |
| Use GSD | Section 2 uses GSD-style planner/checker/verifier gating; execution lanes map to concrete deliverables and validation. |
| Use superpowers | This plan follows superpowers-style checklist execution, gates, and prompt-to-artifact audit. |
| Use skills mentioned in AGENTS.md | Section 2 names the relevant installed skill families and keeps non-core skills off the critical path. |
| Plan remaining implementation | Sections 3-7 cover every missing/partial gate from the implementation map. |
