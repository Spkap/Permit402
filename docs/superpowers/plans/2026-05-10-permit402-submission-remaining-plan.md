# Permit402 Submission Remaining Plan

Created: 2026-05-10

Source plan:
- docs/superpowers/plans/2026-05-09-permit402-implementation-plan.md

Current source-of-truth files inspected:
- README.md
- docs/permit402-plan.md
- docs/team-handoff.md
- docs/submission/program-addresses.md
- docs/submission/track-fit.md
- docs/hackathon-tracks/solana-track.md
- docs/hackathon-tracks/lifi-track.md
- programs/permit402/src/**
- tests/**
- packages/permit402-shared/**
- services/**
- apps/web/**

## 0. Objective Restated

The requested objective is:

1. Check what is still remaining for hackathon submission.
2. Make a plan for all remaining frontend, backend, protocol, services, LI.FI, x402, docs, QA, live demo, and video work.
3. Avoid repeating completed work and base the plan on actual repo evidence.

Submission-ready means:

- latest Rust/Anchor implementation is deployed to devnet;
- README has setup instructions, verified program ID, live demo URL, and video URL;
- demo video is under 3 minutes;
- live demo works from a judge perspective;
- two successful x402 payments create Receipt artifacts;
- at least three rejected attempts create BlockedAttempt artifacts;
- dashboard shows Solscan links for every judge-visible artifact;
- x402 mode is real and documented honestly as hosted, shim, or hybrid;
- LI.FI is used for a real quote, route, widget, bridge, or agent-assisted route flow;
- no unverified claims remain in README or submission docs.

## 1. Current Repo Truth

### Done Or Mostly Done

| Area | Evidence | Current status |
|---|---|---|
| Anchor program implementation | programs/permit402/src/instructions/*, programs/permit402/src/policy_logic.rs | Local implementation exists for policy setup, funding, merchant management, payment, blocked attempts, and close. |
| Anchor local build/test | Latest run in this session: anchor build, anchor idl build, anchor test --skip-build | Passed locally with 12 tests. |
| Rejection/replay tests | tests/permit402_rejections.spec.ts, tests/permit402_replay.spec.ts | Placeholder tests have been replaced; local suite passed. |
| Shared TS package | packages/permit402-shared | Build/typecheck/test passed locally; exports block reasons, categories, x402 hash helpers, policy types, and Solscan helpers. |
| Merchant service | services/merchants | Hono challenge-only endpoints exist; smoke test passed. |
| Facilitator scaffold | services/facilitator | Preflight/duplicate-cache scaffold exists; smoke test passed, but not real on-chain settlement yet. |
| Demo agent mock flow | services/agent/src/run-demo.ts | Mock/local flow produced two paid and three blocked outcomes. |
| Web mock UI | apps/web | /, /demo, /dashboard, /policy, /fund exist; typecheck/build passed locally. |
| LI.FI UI starting point | apps/web/app/fund/page.tsx, apps/web/lib/lifi/route-preview.ts | Deterministic route preview exists; live quote/widget/mirror evidence is not done. |
| Devnet scaffold address | docs/submission/program-addresses.md | Existing program ID and initial deploy tx are recorded. |

### Not Submission Ready Yet

| Area | Gap | Why it blocks submission |
|---|---|---|
| Git/repo state | Current integrated work is still uncommitted on main. | Public repo must contain final code; teammate cannot safely build from local uncommitted state. |
| Latest devnet deploy | Existing devnet address predates latest handler/test fixes. | Solana track requires deployed address for the actual submitted implementation. |
| Devnet demo artifacts | Sample policy, receipts, blocked attempts, and Solscan links are still TBD. | Judges need inspectable on-chain proof, not only local tests. |
| README | Current README is still an early repo overview. | Submission needs setup, run commands, program ID, live URL, video URL, x402 mode, LI.FI explanation. |
| Anchor frontend adapter | apps/web/lib/permit402/adapter.ts and anchor-adapter.ts are missing. | UI is mock-only; it cannot read/write real localnet/devnet state. |
| Phantom/wallet flow | No confirmed wallet connect path in current app. | Policy creation/funding demo needs a believable user-owned setup path or documented demo-mode alternative. |
| x402 final mode | Hosted-vs-shim PDA-vault settlement is not proven. | x402 bonus wording cannot claim hosted settlement from PDA vault unless verified. |
| Real facilitator settlement | services/facilitator does not yet call pay_x402 or record_blocked_attempt. | Demo agent is still mock-local instead of creating real artifacts. |
| Merchant receipt verification | Merchant paid retry accepts mock PAYMENT-SIGNATURE. | Final merchant should verify Receipt/BlockedAttempt, or docs must state demo shim behavior exactly. |
| Keeper integration | services/keeper exists, but final role is unresolved. | If the final story uses keeper/facilitator settlement, it must be wired or cut from the claim. |
| LI.FI integration | Current /fund is a deterministic preview, not live SDK/widget quote or mirror. | LI.FI track requires meaningful real quote/route/widget/agent-assisted transaction flow. |
| Mirror service | services/mirror/src/index.ts is missing. | Mainnet-to-devnet mirror plan is not implemented. Either build it or choose a smaller LI.FI route/quote proof. |
| Submission docs | docs/submission/demo-script.md and docs/submission/qa-checklist.md are missing. | Needed to record and verify the final 3-minute submission flow. |
| Live demo URL | Local dev server exists, but no deployed URL is recorded. | Hackathon submission requires a live demo link. |
| Demo video | No video URL or final script. | Solana track requires video under 3 minutes. |

## 2. Prompt-To-Artifact Checklist

| Requirement | Evidence checked | Status | Remaining action |
|---|---|---|---|
| Read the named implementation plan | docs/superpowers/plans/2026-05-09-permit402-implementation-plan.md | Done | Keep it as source, but use this plan for current gaps. |
| Check what remains for submission | README, submission docs, code tree, package scripts, service files, tests, prior validation logs | Done | Execute the gaps below. |
| Make a plan for frontend/backend/all | This file | Done | Use lanes A-F. |
| Unique Rust Solana program | programs/permit402/src/** | Mostly done locally | Redeploy latest implementation to devnet. |
| Devnet address in docs/README | docs/submission/program-addresses.md has old address; README lacks final submission section | Partial | Update both after redeploy. |
| Public repo ready | git status shows uncommitted and untracked integrated work | Not done | Commit/push once user approves commit boundary. |
| Setup instructions | README has read order and early gates, not final setup | Not done | Add exact install/build/test/run/deploy commands. |
| Live demo link | No deployed app URL in README/submission docs | Not done | Deploy web app and services, then verify URL. |
| Demo video under 3 minutes | Missing | Not done | Write script, rehearse, record, upload/link. |
| Two successful x402 payments | Local mock agent has two paid outcomes | Partial | Create real localnet/devnet Receipt accounts. |
| Three rejected attempts | Local mock agent and tests cover blocks | Partial | Create real BlockedAttempt accounts and Solscan links. |
| Solscan links for artifacts | Program link exists; sample artifact fields are TBD | Not done | Fill policy, receipt, blocked attempt links after seed/demo run. |
| x402 paid API flow | Merchant returns 402; mock retry exists | Partial | Finalize hosted/shim mode and wire facilitator to on-chain program. |
| LI.FI real flow | /fund route preview exists | Partial | Add live widget/SDK quote or mirror proof and docs. |
| Anchor adapter/frontend real mode | Missing adapter files | Not done | Add adapter boundary and devnet/localnet implementation. |
| QA checklist | Missing | Not done | Add final test matrix and run it before video. |

## 3. Remaining Work Plan

### Lane 0: Stabilize The Repo Before More Feature Work

Owner: whoever is driving final integration.

Tasks:

1. Review the current uncommitted integration diff.
2. Commit the merge/integration work in one clean checkpoint.
3. Push or coordinate with teammate before further devnet deployment.
4. Update docs/team-handoff.md if ownership changed after teammate's push.

Exit gate:

- git status is clean except intentional local runtime files.
- Teammate can pull the same code that was locally validated.

### Lane A: Protocol And Devnet Proof

Owner: backend/protocol.

Tasks:

1. Add one focused close-policy behavior test:
   - fund policy;
   - close policy;
   - verify vault balance sweeps back to owner ATA;
   - verify policy cannot pay after close.
2. Add missing cap/expiry coverage if time allows:
   - per-merchant cap;
   - category cap;
   - total cap;
   - daily cap rollover/current day behavior;
   - policy expiry;
   - request expiry.
3. Run protocol gate:
   - cargo fmt --manifest-path programs/permit402/Cargo.toml
   - anchor build --no-idl -- --tools-version v1.52
   - anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts
   - anchor test --skip-build
4. Redeploy or upgrade latest verified program to devnet.
5. Run a seed/demo transaction set on devnet:
   - config;
   - policy;
   - vault funding;
   - merchant registration/binding;
   - category budget;
   - two pay_x402 calls;
   - three record_blocked_attempt calls.
6. Update docs/submission/program-addresses.md with verified:
   - program ID;
   - upgrade/deploy tx;
   - keeper authority;
   - USDC mint;
   - policy vault PDA;
   - two Receipt links;
   - three BlockedAttempt links.

Exit gate:

- Latest local code is deployed.
- Solscan links open for every judge-visible account/tx.
- No TBD remains in program-addresses.md except clearly marked optional extras.

### Lane B: x402 And Service Settlement

Owner: x402/services.

Tasks:

1. Run hosted x402 exact SVM spike:
   - confirm current https://x402.org/facilitator/supported;
   - test normal keypair source ATA path;
   - test or explicitly reject PDA-vault settlement path.
2. Choose final x402 mode:
   - hosted_exact only if tested with the actual settlement path;
   - permit402_shim if PDA-vault settlement requires program CPI;
   - hybrid only if hosted verifies request/proof and shim settles through Permit402.
3. Upgrade services/facilitator from preflight scaffold to real flow:
   - validate policy, merchant, amount, category, nonce, expiry, and payment hash;
   - call pay_x402 for allowed attempts;
   - call record_blocked_attempt for blocked attempts;
   - enforce duplicate request cache.
4. Upgrade services/merchants paid retry:
   - accept proof/receipt reference;
   - verify Receipt or BlockedAttempt before returning data;
   - return clear JSON for judge-visible outcomes.
5. Upgrade services/agent:
   - support mock, localnet, and devnet modes;
   - print transaction signatures and Solscan links;
   - fail loudly if expected receipt/block account is missing.
6. Decide keeper role:
   - wire services/keeper if needed for the final settlement story;
   - otherwise document that facilitator directly submits Permit402 instructions for the demo.

Exit gate:

- Demo agent produces two real receipts and three real blocked attempts in localnet or devnet mode.
- docs/submission/track-fit.md names the exact x402 mode and what was actually verified.

### Lane C: Frontend, Wallet, And Real Program Mode

Owner: frontend.

Tasks:

1. Add adapter boundary files:
   - apps/web/lib/permit402/adapter.ts
   - apps/web/lib/permit402/anchor-adapter.ts
   - apps/web/lib/permit402/pda.ts
2. Keep mock-adapter.ts as a demo fallback, but add environment mode:
   - NEXT_PUBLIC_PERMIT402_MODE=mock|localnet|devnet
   - program ID and RPC endpoint env vars.
3. Add real account reads:
   - policy vault;
   - vault ATA balance;
   - merchant bindings;
   - category budgets;
   - receipts;
   - blocked attempts.
4. Add real instruction actions where practical:
   - create policy;
   - fund policy;
   - add/revoke merchant;
   - set category budget;
   - close policy if included in UI.
5. Add Phantom wallet connection or a clearly labeled demo authority mode.
6. Upgrade /demo:
   - mode indicator;
   - live/mock badge;
   - transaction state;
   - Solscan links from real signatures/accounts.
7. Keep /fund, /policy, /dashboard dense and operational.

Exit gate:

- pnpm --filter @permit402/web typecheck passes.
- pnpm --filter @permit402/web build passes.
- /demo works in mock mode and at least one real mode.
- Browser/manual check covers desktop and mobile widths.

### Lane D: LI.FI Funding Proof

Owner: frontend/LI.FI.

Choose the smallest honest qualifying path:

Option 1, preferred if time allows:

- Add LI.FI Widget to /fund.
- Pre-warm a real mainnet route into Solana.
- Build services/mirror to credit devnet USDC after a verified or rehearsed mainnet route/status.
- Show mainnet route evidence plus devnet mirror tx side-by-side.

Option 2, smaller and still meaningful if bridge/mirror is too risky:

- Use LI.FI SDK/API to fetch a real route/quote involving Solana.
- Show quote details, route steps, estimated receive, fees, and chain/token metadata.
- Add an agent-assisted prepare funding route action.
- Clearly document that vault funding in devnet demo is mirrored/pre-funded, while LI.FI evidence is a real route/quote.

Tasks:

1. Decide Option 1 or Option 2.
2. Implement the chosen path in /fund.
3. Add docs to docs/submission/track-fit.md:
   - exact LI.FI API/widget used;
   - what is live;
   - what is devnet mirror;
   - screenshots or tx/status links if available.
4. Add fallback:
   - if live route stalls during video, use pre-recorded route evidence and pre-funded devnet vault, but say so honestly in docs.

Exit gate:

- LI.FI evidence is real, not cosmetic.
- README explains exactly how LI.FI is integrated.

### Lane E: Submission Docs, Live Demo, And Video

Owner: submission/QA.

Tasks:

1. Rewrite README for final submission:
   - one-sentence product;
   - target tracks;
   - architecture diagram or concise flow;
   - setup commands;
   - test commands;
   - run commands for web/services;
   - devnet program ID;
   - sample Solscan links;
   - live demo URL;
   - video URL;
   - exact x402 mode;
   - exact LI.FI integration;
   - known limitations/no-overclaim section.
2. Add docs/submission/demo-script.md:
   - under 3 minutes;
   - timestamped;
   - begins with policy/vault;
   - shows LI.FI funding/route;
   - two successful x402 payments;
   - three blocked attempts;
   - final dashboard with links.
3. Add docs/submission/qa-checklist.md:
   - local commands;
   - devnet commands;
   - browser checks;
   - mobile/desktop checks;
   - link checks;
   - video rehearsal checklist.
4. Deploy live web app.
5. Deploy or expose services required for the live demo.
6. Record and upload video under 3 minutes.
7. Final submission dry run:
   - open live demo in clean browser;
   - click through /demo, /fund, /dashboard;
   - open every Solscan link;
   - run demo agent once;
   - confirm README commands are copy-pasteable.

Exit gate:

- README, demo script, QA checklist, live URL, and video URL are all present and accurate.

### Lane F: Final Verification Gate

Run immediately before submission:

    export PATH="/opt/homebrew/opt/node@20/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:/opt/homebrew/opt/rustup/bin:/opt/homebrew/bin:$PATH"

    pnpm install
    pnpm lint
    pnpm --filter @permit402/shared build
    pnpm --filter @permit402/shared typecheck
    pnpm --filter @permit402/shared test
    pnpm --filter @permit402/merchants smoke
    pnpm --filter @permit402/facilitator smoke
    pnpm --filter @permit402/web typecheck
    pnpm --filter @permit402/web build

    cargo fmt --manifest-path programs/permit402/Cargo.toml --check
    anchor build --no-idl -- --tools-version v1.52
    anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts
    anchor test --skip-build

    git diff --check

Also verify manually:

- live demo URL loads from a fresh browser;
- /demo has no overlap or broken responsive layout;
- /fund shows real LI.FI evidence;
- two Receipt Solscan links open;
- three BlockedAttempt Solscan links open;
- program address in README matches docs/submission/program-addresses.md;
- video is under 3 minutes;
- no README or docs claim unverified hosted x402 PDA settlement, live LI.FI bridge, or latest devnet deploy before it is true.

## 4. Recommended Execution Order From Here

1. Commit/push current integrated code so the team is no longer split across local-only work.
2. Add close-policy and missing cap/expiry tests.
3. Redeploy latest program and generate devnet artifact links.
4. Finalize x402 mode and wire facilitator/agent to real localnet/devnet instructions.
5. Add frontend Anchor adapter and real mode.
6. Implement the smallest honest LI.FI qualifying path.
7. Write README, demo script, QA checklist.
8. Deploy live demo and services.
9. Record the under-3-minute video.
10. Run Lane F, fix any failures, submit.

## 5. Current Submission Risk Ranking

| Risk | Severity | Mitigation |
|---|---:|---|
| Latest program not redeployed | Critical | Do Lane A before recording. |
| x402 mode overclaimed | Critical | Choose hosted/shim/hybrid based on actual spike. |
| LI.FI remains only a static preview | High | Implement real route/quote/widget evidence. |
| UI remains mock-only | High | Add Anchor adapter or clearly split mock demo from devnet artifact proof. |
| README stays outdated | High | Rewrite after devnet/x402/LI.FI decisions are final. |
| No artifact Solscan links | High | Seed devnet demo accounts and fill docs before video. |
| Demo video too broad | Medium | Use demo-script.md; keep to one story and five payment moments. |

