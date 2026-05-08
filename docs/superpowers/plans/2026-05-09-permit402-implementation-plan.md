# Permit402 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Permit402, a Solana policy vault for autonomous x402 payments where agents can spend from a PDA-owned USDC vault only when an Anchor program says the payment is allowed.

**Architecture:** The product is the Rust program, not the dashboard. Sourabh builds the basic Next.js frontend, x402 merchant flow, LI.FI funding surface, mocks, and demo runner first behind a stable adapter contract; the teammate then builds the Anchor program and backend services against that contract; integration swaps mocks for the deployed IDL and devnet program.

**Tech Stack:** Anchor 0.32.1, Rust, SPL Token / token-interface, Solana devnet, @x402/svm 2.11.0, @x402/core 2.11.0, @lifi/sdk 3.16.3, @lifi/widget 3.40.12, @solana/kit 6.9.0, Phantom Connect, Helius, Next.js 15, Tailwind 4, Hono, pnpm workspaces.

---

## 0. Objective And Success Criteria

This plan exists to let two people build one coherent winning hackathon project without stepping on each other.

Concrete deliverables:

- A unique Anchor/Rust Solana program deployed to devnet.
- A public repo with README, setup instructions, deployed program ID, live demo link, and a demo video under 3 minutes.
- A visible Permit402 demo with policy creation, LI.FI-powered cross-chain funding or route flow, two successful x402 payments, at least three rejected payment attempts recorded on-chain, and Solscan links for every judge-visible artifact.
- A basic frontend built early by Sourabh, using mocks first and the real program later.
- A backend/protocol implementation built later by the teammate, using the same shared contract and no hidden coupling.

Winning bar:

- Judges understand the product in one sentence: "Agents should not get wallets. They should get allowances."
- The demo proves the Rust program is the safety layer.
- x402 is used as the paid API/payment challenge layer, not as a decorative dependency.
- LI.FI is used for a real cross-chain funding, route, quote, or agent-assisted Solana transaction flow.

## 1. Source Of Truth And Evidence

Files read for this plan:

- AGENTS.md
- README.md
- docs/permit402-plan.md
- techstack.md
- candidate-projects/01-Permit402.md
- docs/hackathon-tracks/solana-track.md
- docs/hackathon-tracks/lifi-track.md
- docs/research/integration-spec.md
- docs/research/winner-patterns.md

Facts verified during planning:

- Solana track requires a unique Rust program using Quasar, Anchor, Pinocchio, or vanilla Rust, deployed at least to devnet, with deployment addresses in README, public repo, setup instructions, demo video, and live demo link.
- LI.FI track requires Solana to be core to the user journey and LI.FI to be used for a real quote, route, swap, bridge, or agent-assisted transaction flow.
- Current package versions checked from npm:
  - @x402/svm 2.11.0
  - @lifi/sdk 3.16.3
  - @lifi/widget 3.40.12
  - @coral-xyz/anchor 0.32.1
  - @solana/kit 6.9.0
- Current x402 facilitator support checked from https://x402.org/facilitator/supported:
  - x402 v2 exact on solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1
  - x402 v1 exact on solana-devnet
  - Solana fee payer CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5

## 2. Critical Corrections To Lock In

### 2.1 Failed Solana instructions cannot also write BlockedAttempt accounts

The locked plan says failed pay_x402 checks can fall through to record_blocked_attempt. On Solana, if an instruction returns an error, state changes roll back. A failed pay_x402 cannot also write a BlockedAttempt in that same failed instruction.

Plan decision:

- pay_x402 is success-only. It validates, transfers USDC, creates Receipt, emits X402Paid.
- record_blocked_attempt is a separate successful instruction. It recomputes the policy checks, writes BlockedAttempt, emits X402Blocked, and transfers nothing.
- The agent runtime or keeper first classifies an attempted payment. If it would fail, it calls record_blocked_attempt instead of broadcasting a doomed pay_x402.

This preserves the judge-visible rejection artifact while staying Solana-correct.

### 2.2 Hosted x402 exact SVM may not settle from a PDA vault

x402 exact SVM facilitators commonly validate a direct SPL Token TransferChecked instruction. A PDA-owned vault cannot sign a direct transfer outside the program; the program signs through CPI. That means hosted x402 may not be able to directly settle from the Permit402 vault.

Plan decision:

- Day 0 includes a hard x402 spike to test hosted exact SVM with the desired settlement path.
- If hosted exact works safely, use it.
- If it does not, use a Permit402 facilitator shim:
  - merchant returns standard HTTP 402 and payment requirements;
  - client sends the payment authorization/proof to the shim;
  - shim verifies merchant, nonce, expiry, amount, and hash;
  - shim calls pay_x402 or record_blocked_attempt;
  - merchant verifies Receipt or BlockedAttempt before returning data.
- README must state the exact x402 mode used. Do not claim hosted facilitator settlement from a PDA vault unless that was actually tested.

### 2.3 LI.FI is not a wallet-history or credit-score API

LI.FI routes swaps, bridges, payments, and transaction execution. It does not compute wallet credit scores.

Plan decision:

- Use LI.FI to fund the Permit402 vault from non-Solana assets or to prepare an agent-assisted route into Solana.
- Show the LI.FI route/quote/status in the product.
- Keep ZK and credit scoring as future work only.

### 2.4 Frontend work must start before the program exists

Sourabh should not wait for the Anchor IDL.

Plan decision:

- Build Permit402Adapter first.
- Build MockPermit402Adapter first.
- Later add AnchorPermit402Adapter after teammate ships IDL and devnet deployment.
- Frontend imports shared types and adapter methods, not Anchor internals.

## 3. Scope Challenge And Scope Lock

Complexity check:

- The full system touches more than 8 files and more than 2 services.
- This complexity is justified by the three confirmed tracks: Solana Rust program, x402 payment flow, and LI.FI Solana UX.

Scope reduction applied:

- No ZK implementation.
- No Swig implementation.
- No v0, ElevenLabs, Solana Mobile, Virtuals, NoahAI, or extra sponsor tracks.
- No full cross-chain credit scoring.
- No general-purpose agent marketplace.
- No production-grade hosted payment processor.
- No mobile app.

Complete version still required:

- Real Anchor program with real policy enforcement.
- Real x402 HTTP 402 flow, even if final settlement uses a local Permit402 facilitator shim.
- Real LI.FI quote, route, widget, bridge, or agent-assisted Solana route flow.
- Real devnet deployment and Solscan links.
- Real rejection artifacts on-chain.

## 4. What Already Exists

Existing repo assets:

| Asset | Reuse decision |
|---|---|
| AGENTS.md | Use as repo operating rules and track boundary. |
| docs/permit402-plan.md | Use for product direction and demo script, but correct rejected-instruction fallthrough. |
| candidate-projects/01-Permit402.md | Use as full vision spec and product language. |
| techstack.md | Use for versions and stack picks. |
| docs/hackathon-tracks/*.md | Use as submission requirements. |
| docs/research/integration-spec.md | Use for x402, LI.FI, and program integration boundaries. |
| docs/research/winner-patterns.md | Use for judge psychology, what-wins framing, and what to avoid. |

No application code exists yet in this repo. The implementation should create a monorepo at the current repository root. Do not create a nested second repo unless a scaffold tool temporarily generates one for copying patterns.

## 5. Architecture

### 5.1 Component Map

    Next.js app
      /fund /policy /dashboard /demo
      |
      | Permit402Adapter
      |
      +--> MockPermit402Adapter for early UI
      |
      +--> AnchorPermit402Adapter after IDL
             |
             v
    Permit402 Anchor program on Solana devnet
      - PolicyVault PDA owns USDC ATA
      - Merchant allowlist
      - per-call, per-merchant, category, total, and daily caps
      - expiry and nonce replay protection
      - Receipt accounts for paid calls
      - BlockedAttempt accounts for rejected calls
             |
             | SPL Token CPI transfer_checked
             v
    Merchant USDC ATA

    Agent runtime -> Merchant APIs -> HTTP 402 -> Permit402 decision -> retry or block
    LI.FI Widget/SDK -> route/quote/status -> vault funding UX

### 5.2 Payment Decision Flow

    Agent wants paid API result
      |
      v
    Merchant returns HTTP 402 with payment requirements and payment_req_hash
      |
      v
    Permit402 client classifies the attempt
      |
      +-- allowed:
      |     call pay_x402
      |     program transfers USDC from vault ATA to merchant ATA
      |     Receipt PDA is created
      |     merchant verifies receipt
      |     merchant returns data
      |
      +-- blocked:
            call record_blocked_attempt
            program writes BlockedAttempt PDA
            funds stay in vault
            UI shows reason and Solscan link

### 5.3 Why This Is Not A Generic Wrapper

- The agent does not hold spendable USDC in a normal hot wallet.
- The policy vault is a PDA-owned token account.
- Only the Rust program can transfer from the vault.
- The program enforces allowlist, caps, expiry, request binding, and replay protection.
- The demo includes negative paths where the model tries to spend and the program blocks it.
- Every important outcome is visible through Solscan links.

## 6. Repository Layout To Build

Target layout:

    .
    Anchor.toml
    Cargo.toml
    package.json
    pnpm-workspace.yaml
    README.md
    programs/permit402/src/lib.rs
    programs/permit402/src/constants.rs
    programs/permit402/src/errors.rs
    programs/permit402/src/events.rs
    programs/permit402/src/instructions/*.rs
    programs/permit402/src/state/*.rs
    tests/permit402_policy.spec.ts
    tests/permit402_rejections.spec.ts
    tests/permit402_replay.spec.ts
    tests/helpers/fixtures.ts
    tests/helpers/pda.ts
    tests/helpers/token.ts
    apps/web/app/page.tsx
    apps/web/app/fund/page.tsx
    apps/web/app/policy/page.tsx
    apps/web/app/dashboard/page.tsx
    apps/web/app/demo/page.tsx
    apps/web/components/*.tsx
    apps/web/lib/permit402/adapter.ts
    apps/web/lib/permit402/mock-adapter.ts
    apps/web/lib/permit402/anchor-adapter.ts
    apps/web/lib/x402/*.ts
    apps/web/lib/lifi/*.ts
    services/agent/src/run-demo.ts
    services/facilitator/src/server.ts
    services/keeper/src/index.ts
    services/merchants/src/server.ts
    services/mirror/src/index.ts
    packages/permit402-shared/src/index.ts
    packages/permit402-shared/src/policy.ts
    packages/permit402-shared/src/x402.ts
    docs/submission/demo-script.md
    docs/submission/program-addresses.md
    docs/submission/track-fit.md
    docs/submission/qa-checklist.md

## 7. Shared Contract

Create the shared contract before frontend and backend diverge.

Shared types:

- MerchantCategory: research, translate, storage, tooling.
- BlockReason:
  - UnauthorizedAgent
  - PolicyExpired
  - MerchantNotAllowed
  - ReceiptAlreadyExists
  - PerCallCapExceeded
  - MerchantCapExceeded
  - CategoryCapExceeded
  - TotalCapExceeded
  - DailyCapExceeded
  - PaymentRequestHashMismatch
- PolicyDraft:
  - owner
  - agentAuthority
  - totalCapUsdc
  - dailyCapUsdc
  - perCallCapUsdc
  - expiresAtUnix
- MerchantConfig:
  - id
  - displayName
  - endpointUrl
  - merchantWallet
  - category
  - allowlisted
  - perMerchantCapUsdc
- ReceiptView:
  - policy
  - merchant
  - nonce
  - amountUsdc
  - category
  - paymentReqHash
  - txSignature
  - solscanUrl
  - createdAtUnix
- BlockedAttemptView:
  - policy
  - merchant
  - attemptedAuthority
  - recorder
  - nonce
  - attemptedAmountUsdc
  - category
  - reason
  - paymentReqHash
  - expectedPaymentReqHash when the reason is PaymentRequestHashMismatch
  - txSignature
  - solscanUrl
  - createdAtUnix

Adapter interface:

- getPolicy returns PolicySummary.
- createPolicy accepts PolicyDraft and returns PolicySummary.
- listMerchants returns MerchantConfig array.
- setMerchantAllowlist changes mock or program state.
- payX402 accepts merchant, amount, category, nonce, paymentReqHash, attemptedAuthority and returns ReceiptView.
- recordBlockedAttempt accepts the same payment attempt plus optional expectedPaymentReqHash and returns BlockedAttemptView.
- listReceipts returns ReceiptView array.
- listBlockedAttempts returns BlockedAttemptView array.

Rule:

- MockPermit402Adapter and AnchorPermit402Adapter must satisfy the same interface.
- If either person needs a new field, update packages/permit402-shared first.

## 8. Anchor Program Design

### 8.1 Framework

Use Anchor.

Reason:

- Anchor is fastest for PDAs, account validation, IDL, TypeScript client generation, and tests.
- The hackathon requires a shipped Rust program more than micro-optimized compute.
- Pinocchio is not worth the development risk for this team and this timeline.

### 8.2 Authority Model

| Authority | Purpose |
|---|---|
| owner | Human wallet that creates, funds, edits, and closes policy. |
| agent_authority | Hot key used by agent runtime. It can request spends only through the program. |
| keeper_authority | Optional backend signer used by facilitator shim after verifying x402 challenge. |
| attempted_authority | The key that attempted the spend. For successful pay_x402 this must be agent_authority or keeper_authority. For record_blocked_attempt it can be any attempted key so UnauthorizedAgent can be recorded. |
| recorder | The signer that pays for and records a BlockedAttempt. It must be either keeper_authority or the same key as attempted_authority. |
| policy_vault PDA | Program-owned state and signer seed authority for token transfers. |
| vault_ata | USDC token account owned by policy_vault PDA. |
| merchant_wallet | Merchant identity. |
| merchant_ata | Merchant USDC recipient token account. |

The agent authority must never receive the vault USDC directly.

### 8.3 PDA Seeds

| Account | Seeds |
|---|---|
| Config | config |
| PolicyVault | policy, owner, policy_index_u64 |
| AgentAuthority | agent, policy_vault, agent_authority |
| Merchant | merchant, merchant_wallet |
| MerchantBinding | merchant_binding, policy_vault, merchant |
| CategoryBudget | category_budget, policy_vault, category_u8 |
| Receipt | receipt, policy_vault, nonce_u64 |
| BlockedAttempt | blocked, policy_vault, nonce_u64, attempt_hash_prefix_8 |

Receipt seed uses nonce as the replay guard. Receipt stores payment_req_hash. BlockedAttempt seed includes a short attempt hash so several blocked attempts with the same nonce do not collide during testing.

### 8.4 State Fields

PolicyVault:

- owner: Pubkey
- agent_authority: Pubkey
- vault_ata: Pubkey
- usdc_mint: Pubkey
- policy_index: u64
- total_cap: u64
- total_spent: u64
- daily_cap: u64
- spent_today: u64
- current_day: i64
- default_per_call_cap: u64
- expires_at: i64
- closed: bool
- bump: u8

Merchant:

- merchant_wallet: Pubkey
- merchant_ata: Pubkey
- name: fixed 32 byte array
- endpoint_hash: 32 bytes
- category: u8
- bump: u8

MerchantBinding:

- policy: Pubkey
- merchant: Pubkey
- allowed: bool
- per_call_cap: u64
- per_merchant_cap: u64
- spent: u64
- bump: u8

CategoryBudget:

- policy: Pubkey
- category: u8
- cap: u64
- spent: u64
- bump: u8

Receipt:

- policy: Pubkey
- merchant: Pubkey
- amount: u64
- category: u8
- nonce: u64
- payment_req_hash: 32 bytes
- settlement_signature_hash: 32 bytes
- created_at: i64
- bump: u8

BlockedAttempt:

- policy: Pubkey
- merchant: Pubkey
- attempted_authority: Pubkey
- recorder: Pubkey
- amount: u64
- category: u8
- nonce: u64
- payment_req_hash: 32 bytes
- expected_payment_req_hash: 32 bytes
- reason: u8
- created_at: i64
- bump: u8

### 8.5 Instructions

init_config:

- Creates Config.
- Validates admin signer and fee_bps <= 500.

create_policy:

- Creates PolicyVault, AgentAuthority, and vault ATA.
- Validates owner signs, caps are non-zero, daily cap <= total cap, per-call cap <= daily cap, expiry is future, vault ATA is for configured USDC mint.

fund_policy:

- Transfers USDC from owner ATA into vault ATA.
- Validates owner signs, amount is non-zero, and mint matches.

register_merchant:

- Creates global Merchant.
- For hackathon speed, allow policy owner to register demo merchants.
- Validates name length, endpoint hash, merchant ATA, and category.

add_merchant:

- Creates or updates MerchantBinding.
- Validates owner signs, merchant exists, caps are non-zero, per-call cap <= per-merchant cap, per-call cap <= policy daily cap.

revoke_merchant:

- Sets MerchantBinding.allowed = false.
- Validates owner signs.

set_category_budget:

- Creates or updates CategoryBudget.
- Validates owner signs, category is known, cap is non-zero, cap <= total policy cap.

pay_x402:

- Success path only.
- Signer must be agent_authority or keeper_authority.
- Validates policy is open, policy not expired, x402 request not expired, merchant binding exists and is allowed, amount non-zero, amount within per-call cap, merchant cap, category cap, total cap, and daily cap, payment_req_hash not zero, receipt PDA empty.
- Effects: update spend counters, transfer USDC by SPL Token CPI using policy PDA signer seeds, create Receipt, emit X402Paid.

record_blocked_attempt:

- Rejection artifact path.
- Accepts attempted_authority as an instruction argument or account.
- Recorder signer must be keeper_authority or must equal attempted_authority.
- This is what makes UnauthorizedAgent recordable: an unapproved attempted_authority can sign its own failed attempt, or the keeper can record the attempt after the x402 service observes it.
- Recomputes the first failing policy reason using the same helper as pay_x402.
- If the attempt would pass, returns AttemptWouldPass and writes nothing.
- PaymentRequestHashMismatch is only valid when recorder is keeper_authority and expected_payment_req_hash differs from payment_req_hash. The program cannot fetch HTTP challenge data by itself; the keeper/facilitator attests to the expected hash after verifying the x402 challenge.
- Effects: create BlockedAttempt, emit X402Blocked, transfer nothing.

close_policy:

- Sweeps remaining vault USDC to owner ATA and marks policy closed.
- Validates owner signs.

Reason priority:

1. UnauthorizedAgent
2. PolicyExpired
3. MerchantNotAllowed
4. ReceiptAlreadyExists
5. PerCallCapExceeded
6. MerchantCapExceeded
7. CategoryCapExceeded
8. TotalCapExceeded
9. DailyCapExceeded
10. PaymentRequestHashMismatch

Use this exact order in Rust, TypeScript, tests, and UI copy.

## 9. x402 Design

Sourabh owns the x402 surface:

- merchant API server;
- HTTP 402 challenge format;
- payment request hash canonicalization;
- demo agent that reacts to 402 responses;
- local facilitator shim if hosted exact SVM cannot settle from PDA vault;
- frontend UI that shows challenge, policy decision, and Solscan artifact.

Merchant API endpoints:

- GET /research
- POST /translate
- GET /attacker
- GET /health

Unpaid request behavior:

- return HTTP 402;
- include PAYMENT-REQUIRED header;
- include JSON body for demo visibility;
- include merchant id, endpoint URL, method, amount, category, merchant wallet, merchant ATA, nonce, request expiry, and payment_req_hash.

Canonical payment hash:

    sha256(method + newline + url + newline + merchant_wallet + newline + merchant_ata + newline + amount_base_units + newline + category + newline + nonce + newline + request_expires_at)

Do not hash pretty-printed JSON.

Settlement modes:

| Mode | Use when | Notes |
|---|---|---|
| hosted_exact | @x402/svm can satisfy hosted facilitator and Permit402 can enforce before funds move | Best if verified. |
| permit402_facilitator | hosted exact cannot settle PDA vault safely | Likely practical MVP. Keeps HTTP 402 flow and program-enforced spend. |
| demo_proof | both previous modes fail during build | Last resort. Merchant accepts Permit402 receipt tx signature after 402 challenge. Must be labeled honestly. |

Hosted exact compatibility checklist:

- Exact SVM requires a client-signed transaction completed by the facilitator.
- Exact SVM validates TransferChecked, exact amount, destination ATA, fee payer, and instruction layout.
- A direct hosted exact transfer from the policy vault is only compatible if the SDK/facilitator can accept the actual source authority model. A PDA vault normally needs Anchor CPI signer seeds, so assume shim mode until tested.
- If hosted exact is used for a separate hot-agent account, that account must hold only tiny demo funds and the README must not imply the PDA vault enforced that direct hosted transfer.

Day-0 commands:

    curl -fsSL https://x402.org/facilitator/supported
    npm view @x402/svm version

Decision gate:

- If hosted path works, set X402_MODE=hosted_exact.
- If not, set X402_MODE=permit402_facilitator.
- Write the decision into docs/submission/track-fit.md before deeper integration.

## 10. LI.FI Design

LI.FI must solve a real user problem:

- user starts with assets outside Solana;
- user wants Permit402 vault funded on Solana;
- LI.FI gives a route, quote, widget, status, bridge, or agent-assisted transaction path;
- the app receives value or prepares a transaction for Solana.

MVP flow:

- Build apps/web/app/fund/page.tsx.
- Add LI.FI Widget configured to a Solana destination.
- Add route preview fallback using LI.FI SDK or REST.
- Use LI.FI Solana identifiers consistently: SDK/API routes may use SOL or Solana chain id 1151111081099710 depending on endpoint, and chainTypes=SVM when discovering Solana chains/tools.
- Treat the LI.FI Widget as mainnet-oriented. It cannot directly fund a devnet vault, so the devnet mirror is a demo bridge between real route evidence and devnet program testing.
- Show source chain, destination chain, token, tool, estimated output, and status.
- Add devnet mirror panel:
  - mainnet route seen;
  - devnet vault funded;
  - both signatures shown when available.

Hackathon safety:

- Keep a devnet mock USDC mint/faucet path for rehearsals.
- Use a real LI.FI route/quote at minimum.
- Execute a small real bridge if funds and timing allow.
- If live bridge stalls, show route/quote and devnet mirror funding, and document the truth.

Stretch:

- Agent-assisted top-up when vault balance falls below threshold.
- Only build after the core demo works.

## 11. Frontend Design

UX principle:

- This is a control room for agent spending, not a landing page.

First screen should show:

- policy status;
- vault balance;
- remaining daily budget;
- allowed merchants;
- demo runner;
- receipts and blocked attempts.

Avoid:

- hero marketing page;
- generic chatbot UI;
- vague analytics dashboard;
- huge decorative cards.

Pages:

| Page | Purpose |
|---|---|
| / | Redirect to /demo or show the demo control room. |
| /fund | LI.FI funding panel, devnet mirror, vault balance. |
| /policy | Create policy, edit caps, toggle merchants, set expiry. |
| /dashboard | Receipts, blocked attempts, budgets, Solscan links. |
| /demo | One-button scripted judge demo. |

Visual system:

- operational, compact, high signal;
- green for paid receipts;
- red for blocked attempts;
- yellow for pending/preflight;
- blue for LI.FI route/funding;
- monospaced hashes and signatures;
- fixed row heights so the recording does not jump.

## 12. Two-Person Split

Sourabh owns:

- apps/web/**
- services/merchants/**
- services/facilitator/** until protocol integration
- services/agent/**
- apps/web/lib/x402/**
- apps/web/lib/lifi/**
- initial packages/permit402-shared/**
- docs/submission/demo-script.md

Teammate owns:

- programs/permit402/**
- tests/**
- services/keeper/**
- Anchor IDL generation and devnet deploy
- docs/submission/program-addresses.md

Shared:

- packages/permit402-shared/**
- apps/web/lib/permit402/anchor-adapter.ts
- README final setup and submission text

Handoff from Sourabh to teammate:

- shared TypeScript types;
- demo merchant identities;
- canonical payment hash function;
- expected block reason order;
- mock adapter behavior;
- x402 mode decision.

Handoff from teammate to Sourabh:

- IDL file;
- devnet program ID;
- USDC mint address;
- PDA derivation rules;
- sample successful receipt tx;
- sample blocked attempt tx.

Integration is complete only when frontend can switch between mock mode and anchor mode with one environment variable.

## 13. Phase Plan

### Phase 0: Foundation And Shared Contract

Owner: Sourabh first, teammate reviews before protocol work.

Files:

- package.json
- pnpm-workspace.yaml
- packages/permit402-shared/src/index.ts
- packages/permit402-shared/src/policy.ts
- packages/permit402-shared/src/x402.ts
- docs/submission/track-fit.md

Steps:

- [ ] Initialize pnpm workspace at repo root.
- [ ] Add workspace package globs for apps, services, and packages.
- [ ] Add shared Permit402 domain types from Section 7.
- [ ] Add block reason enum in the exact order from Section 8.5.
- [ ] Add canonical x402 payment request hash helper.
- [ ] Add docs/submission/track-fit.md with only Solana, x402, and LI.FI.
- [ ] Run pnpm install.
- [ ] Run typecheck once scripts exist.
- [ ] Inspect git diff and commit after checks pass.

Validation:

- Shared package imports from a smoke file.
- No frontend code imports Anchor internals.

### Phase 1: x402 Spike And Merchant Mocks

Owner: Sourabh.

Files:

- services/merchants/src/server.ts
- services/facilitator/src/server.ts
- services/agent/src/run-demo.ts
- apps/web/lib/x402/challenge.ts
- apps/web/lib/x402/payment-hash.ts
- apps/web/lib/x402/client.ts
- docs/submission/track-fit.md

Steps:

- [ ] Run facilitator supported check.
- [ ] Save observed Solana network string and fee payer in track-fit.md.
- [ ] Install x402 packages pinned to 2.11.0.
- [ ] Build Hono merchant server with research, translate, attacker, and health routes.
- [ ] Build canonical payment hash helper and fixed fixture test.
- [ ] Implement 402 response builder with PAYMENT-REQUIRED.
- [ ] Implement payment proof parser with PAYMENT-SIGNATURE.
- [ ] Test exact SVM hosted flow with a normal keypair source ATA so the team understands the happy path.
- [ ] Test whether hosted exact SVM can support the desired Permit402 PDA-vault settlement path.
- [ ] Record whether the hosted path uses the PDA vault, a tiny hot-agent demo account, or neither.
- [ ] If hosted path fails, implement Permit402 facilitator shim mode.
- [ ] Build run-demo.ts to call research, translate, and attacker.
- [ ] Add smoke script that starts merchant server and observes two 402 challenges.

Validation commands:

- pnpm --filter @permit402/merchants dev
- pnpm --filter @permit402/agent demo:mock

Expected:

- merchant health endpoint returns 200;
- unpaid merchant call returns 402;
- challenge includes method, URL, amount, merchant wallet, category, nonce, expiry, and hash;
- mock paid call returns 200 after proof.
- docs/submission/track-fit.md states which x402 mode was selected and why.

### Phase 2: Basic Frontend With Mock Adapter

Owner: Sourabh.

Files:

- apps/web/app/page.tsx
- apps/web/app/demo/page.tsx
- apps/web/app/fund/page.tsx
- apps/web/app/policy/page.tsx
- apps/web/app/dashboard/page.tsx
- apps/web/components/demo-runner.tsx
- apps/web/components/budget-meter.tsx
- apps/web/components/receipt-list.tsx
- apps/web/components/blocked-attempt-list.tsx
- apps/web/components/merchant-table.tsx
- apps/web/components/solscan-link.tsx
- apps/web/lib/permit402/adapter.ts
- apps/web/lib/permit402/mock-adapter.ts

Steps:

- [ ] Scaffold Next.js 15 app under apps/web.
- [ ] Add Tailwind 4 and basic component structure.
- [ ] Implement Permit402Adapter.
- [ ] Implement MockPermit402Adapter with deterministic fake state.
- [ ] Build /demo as first useful screen.
- [ ] Build policy summary with vault balance and caps.
- [ ] Build merchant allowlist table.
- [ ] Build demo runner timeline.
- [ ] Build receipt list with fake Solscan links.
- [ ] Build blocked attempt list with fake Solscan links.
- [ ] Build /policy form against mock adapter.
- [ ] Build /dashboard as expanded audit view.
- [ ] Run the whole mock demo without backend.

Validation commands:

- pnpm --filter @permit402/web dev
- pnpm --filter @permit402/web typecheck
- pnpm --filter @permit402/web lint

Manual browser checks:

- demo page fits on laptop screen;
- one click produces two receipts and three blocked attempts;
- blocked reasons are visually distinct;
- no label or hash overlaps its container;
- switching merchants does not mutate unrelated state.

### Phase 3: LI.FI Funding Surface

Owner: Sourabh.

Files:

- apps/web/components/lifi-funding-panel.tsx
- apps/web/lib/lifi/widget-config.ts
- apps/web/lib/lifi/route-preview.ts
- apps/web/lib/lifi/chains.ts
- services/mirror/src/index.ts
- apps/web/app/fund/page.tsx
- docs/submission/track-fit.md

Steps:

- [ ] Install @lifi/widget 3.40.12 and @lifi/sdk 3.16.3.
- [ ] Configure LI.FI Widget with Solana destination.
- [ ] Build route preview fallback through LI.FI SDK or REST.
- [ ] Verify Solana route discovery through LI.FI using SOL / chainTypes=SVM or chain id 1151111081099710.
- [ ] Show source chain, destination chain, token, tool, and estimated output.
- [ ] Build devnet mirror service that can credit devnet USDC for demo after route confirmation or rehearsal trigger.
- [ ] Document exactly what was live and what was mirrored in track-fit.md.
- [ ] Add UI states for route loading, route unavailable, route ready, and mirrored funding complete.

Validation:

- LI.FI widget renders on /fund.
- Route preview returns a real route or a clear unavailable state.
- Devnet vault funding UI updates mock adapter balance.
- No claim is made that LI.FI scored wallet history or credit.

### Phase 4: Anchor Program Test Scaffold

Owner: Teammate.

Files:

- Anchor.toml
- Cargo.toml
- programs/permit402/Cargo.toml
- programs/permit402/src/lib.rs
- programs/permit402/src/constants.rs
- programs/permit402/src/errors.rs
- programs/permit402/src/events.rs
- programs/permit402/src/state/*.rs
- programs/permit402/src/instructions/*.rs
- tests/helpers/*.ts
- tests/permit402_policy.spec.ts
- tests/permit402_rejections.spec.ts
- tests/permit402_replay.spec.ts

Steps:

- [ ] Scaffold Anchor program at repo root.
- [ ] Add state structs and account sizes.
- [ ] Add error enum matching shared BlockReason.
- [ ] Add event structs.
- [ ] Add PDA helpers in tests.
- [ ] Add local token mint and ATA helper.
- [ ] Add helper that derives Receipt and BlockedAttempt PDAs exactly as Section 8.3 describes.
- [ ] Write failing test for create_policy.
- [ ] Write failing test for fund_policy.
- [ ] Write failing test for merchant registration and allowlist.
- [ ] Write failing test for successful pay_x402.
- [ ] Write failing tests for all blocked reasons.
- [ ] Write UnauthorizedAgent rejection test where recorder equals attempted_authority and attempted_authority is not policy.agent_authority.
- [ ] Write keeper-recorded rejection test where recorder is keeper_authority and attempted_authority is not the keeper.
- [ ] Write PaymentRequestHashMismatch test where keeper supplies expected_payment_req_hash different from payment_req_hash.
- [ ] Write replay test using same nonce twice.

Validation commands:

- anchor build
- anchor test
- cargo fmt --all -- --check
- cargo clippy --all-targets -- -D warnings

Expected before implementation:

- tests fail because instructions are not implemented.

Expected after implementation:

- all tests pass locally.

### Phase 5: Anchor Program Implementation

Owner: Teammate.

Steps:

- [ ] Implement init_config.
- [ ] Implement create_policy.
- [ ] Implement fund_policy.
- [ ] Implement register_merchant.
- [ ] Implement add_merchant.
- [ ] Implement revoke_merchant.
- [ ] Implement set_category_budget.
- [ ] Implement shared classify_attempt helper used by pay_x402 and record_blocked_attempt.
- [ ] Implement pay_x402.
- [ ] Implement record_blocked_attempt.
- [ ] Implement close_policy.
- [ ] Keep stretch instructions out of the crate until MVP tests pass.
- [ ] Run full Anchor test suite.
- [ ] Generate IDL.
- [ ] Deploy to devnet.
- [ ] Write program ID and sample accounts into docs/submission/program-addresses.md.

Validation:

- successful payment moves token balance from vault ATA to merchant ATA;
- failed policy checks do not move token balance;
- record_blocked_attempt refuses to write a blocked account when the attempt would pass;
- UnauthorizedAgent can be recorded without giving the unauthorized key spend permission;
- PaymentRequestHashMismatch cannot be recorded by a non-keeper signer;
- replay with duplicate nonce is blocked;
- daily reset works using clock manipulation or deterministic helper;
- devnet deployment is recorded with real addresses.

### Phase 6: Anchor Adapter Integration

Owner: Shared. Sourabh drives frontend adapter; teammate supports IDL and PDA issues.

Files:

- apps/web/lib/permit402/anchor-adapter.ts
- apps/web/lib/permit402/pda.ts
- apps/web/lib/permit402/adapter.ts
- apps/web/app/demo/page.tsx
- services/facilitator/src/server.ts
- services/agent/src/run-demo.ts

Steps:

- [ ] Copy IDL into frontend build path or import generated client.
- [ ] Implement PDA derivation functions.
- [ ] Implement getPolicy.
- [ ] Implement createPolicy.
- [ ] Implement listMerchants.
- [ ] Implement payX402.
- [ ] Implement recordBlockedAttempt.
- [ ] Implement receipt and blocked account fetching.
- [ ] Add env switch between mock and anchor modes.
- [ ] Run demo in mock mode.
- [ ] Run demo in anchor mode on local validator.
- [ ] Run demo in anchor mode on devnet.

Validation:

- UI shows real policy PDA.
- UI shows real vault ATA.
- successful x402 demo creates real Receipt.
- attacker demo creates real BlockedAttempt.
- replay demo creates real BlockedAttempt.
- over-cap demo creates real BlockedAttempt.
- displayed Solscan links open the correct devnet artifacts.

### Phase 7: Keeper And Facilitator Hardening

Owner: Shared. Sourabh owns x402; teammate owns program calls and Helius details.

Files:

- services/facilitator/src/server.ts
- services/keeper/src/index.ts
- services/merchants/src/server.ts
- services/agent/src/run-demo.ts

Steps:

- [ ] Decide final X402_MODE from Phase 1.
- [ ] If hosted exact works, wire hosted verify/settle and still preflight Permit402 before irreversible transfer.
- [ ] If shim mode is used, make facilitator shim verify payment hash, nonce, expiry, and merchant identity before program call.
- [ ] Add duplicate request cache keyed by policy + nonce + payment_req_hash.
- [ ] Add Helius or RPC log watcher only if it improves judge visibility.
- [ ] Add structured logs for every demo step.
- [ ] Make merchant server verify receipt existence before returning paid content.
- [ ] Make blocked attempts return a clear demo response instead of crashing the agent.

Validation:

- duplicate x402 request does not create a second receipt;
- merchant cannot be paid if removed from allowlist;
- attacker route cannot trick facilitator into using a different merchant wallet;
- invalid payment hash fails closed;
- service restart does not break already-created on-chain artifacts.

### Phase 8: Submission Readiness

Owner: Shared.

Files:

- README.md
- docs/submission/demo-script.md
- docs/submission/track-fit.md
- docs/submission/program-addresses.md
- docs/submission/qa-checklist.md

Steps:

- [ ] Add project name and one-line description to README.
- [ ] Add setup instructions.
- [ ] Add devnet program ID.
- [ ] Add deployed app URL.
- [ ] Add demo video URL.
- [ ] Add track-fit section for Solana, x402, and LI.FI.
- [ ] Add exact x402 mode used.
- [ ] Add exact LI.FI integration used.
- [ ] Add known limitations honestly.
- [ ] Record a demo under 3 minutes.
- [ ] Rehearse from a clean browser session.
- [ ] Rehearse with fresh devnet accounts.

Demo script:

- 0:00: "Agents should not get wallets. They should get allowances."
- 0:08: Show LI.FI funding route into Solana app.
- 0:30: Create policy with caps and merchant allowlist.
- 0:55: Agent calls research API, gets 402, Permit402 pays, Receipt appears.
- 1:15: Agent calls translate API, gets 402, Permit402 pays, Receipt appears.
- 1:35: Malicious attacker API attempt, MerchantNotAllowed BlockedAttempt appears.
- 1:55: Replay old nonce, ReceiptAlreadyExists BlockedAttempt appears.
- 2:15: Approved merchant over per-call cap, PerCallCapExceeded BlockedAttempt appears.
- 2:35: Final dashboard: vault balance, remaining budget, 2 receipts, 3 blocked, program ID.
- 2:50: "x402 lets agents pay. Permit402 decides whether they are allowed to."

## 14. Test Plan

### 14.1 Protocol Coverage Matrix

| Code path | Required tests |
|---|---|
| create_policy | valid caps, daily cap over total cap, expired policy. |
| fund_policy | valid USDC deposit, wrong mint, zero amount. |
| merchant management | register merchant, add merchant, revoke merchant. |
| pay_x402 | allowed merchant, token balances, receipt created. |
| record_blocked_attempt | every BlockReason, UnauthorizedAgent with unapproved attempted_authority, keeper-recorded rejection, PaymentRequestHashMismatch keeper-only path, and AttemptWouldPass guard. |
| close_policy | owner sweep and non-owner rejection. |

Blocked reason tests:

- UnauthorizedAgent
- MerchantNotAllowed
- PolicyExpired
- PerCallCapExceeded
- MerchantCapExceeded
- CategoryCapExceeded
- DailyCapExceeded
- TotalCapExceeded
- ReceiptAlreadyExists
- PaymentRequestHashMismatch

### 14.2 Frontend Tests

Unit tests:

- payment hash is deterministic;
- mock adapter demo creates 2 receipts and 3 blocked attempts;
- budget meter renders healthy, warning, and exhausted states;
- demo runner uses the expected step order.

Playwright checks after UI exists:

- /demo loads;
- clicking Run Demo shows five artifacts;
- /fund shows LI.FI route or clear unavailable state;
- /dashboard links render devnet Solscan URLs.

### 14.3 Integration Tests

Run after Anchor adapter exists:

- merchant 402 -> Permit402 payment -> receipt -> merchant 200;
- attacker 402 -> Permit402 block -> blocked artifact -> no token transfer;
- replay old nonce -> blocked artifact -> no second transfer;
- over-cap approved merchant -> blocked artifact -> no transfer;
- frontend anchor mode displays all real artifacts.

### 14.4 QA Checklist Artifact

Create docs/submission/qa-checklist.md with these checks:

- devnet program ID present;
- app URL loads;
- video under 3 minutes;
- README setup works from clone;
- two receipts visible on Solscan;
- three blocked attempts visible on Solscan;
- LI.FI route/quote evidence visible;
- x402 mode explained;
- no unrelated sponsor claims.

## 15. Failure Modes And Mitigations

| Failure mode | Impact | Mitigation |
|---|---|---|
| Hosted x402 exact cannot settle PDA vault transfer | x402 integration risk | Use Permit402 facilitator shim and document x402-compatible flow honestly. |
| pay_x402 fails and no rejection artifact is written | Demo loses key proof | Use separate record_blocked_attempt instruction after classification. |
| LI.FI bridge is slow live | Demo stalls | Pre-warm route; show quote/status; use devnet mirror funding path for recording. |
| Anchor tests take too long to fix | No Solana track | Cut stretches and focus only policy, receipts, blocked attempts, deploy. |
| Frontend waits for backend | Sourabh blocked | Mock adapter first; all pages work before IDL. |
| Backend changes shared fields late | Integration conflict | All field changes go through packages/permit402-shared. |
| Agent key compromised | Real product flaw | Funds remain in PDA vault and are limited by policy caps and allowlist. |
| Merchant proof forged | Merchant may return data without payment | Merchant verifies on-chain Receipt by policy, merchant, nonce, hash, and amount. |
| UnauthorizedAgent cannot be recorded because instruction rejects the signer too early | Missing rejection artifact | record_blocked_attempt accepts attempted_authority and recorder separately; tests cover unapproved attempted_authority. |
| Program overclaims HTTP hash verification | Misleading security claim | Program stores/binds hashes; keeper/facilitator verifies HTTP challenge data and only keeper can record PaymentRequestHashMismatch. |
| Duplicate nonce creates weird state | Replay risk | Receipt PDA collision and replay tests. |
| Daily cap reset buggy | Bad spend limits | Use clock/sysvar tests and deterministic day calculation. |

Critical silent gaps accepted by this plan:

- None. Any failure that can move funds must either be tested or fail closed.

## 16. Performance And Reliability Notes

Solana program:

- Keep pay_x402 account list small.
- Use u64 base units for USDC amounts.
- Avoid dynamic strings in accounts except fixed byte arrays.
- Keep payment request hash as 32 bytes.
- Use one shared policy classification helper to prevent drift between payment and block paths.

Frontend:

- Poll accounts only during demo steps or dashboard refresh.
- Cache mock data in local React state.
- Avoid large dependency additions.
- Keep long signatures truncated with copy/open buttons.

Services:

- Add request IDs to merchant/facilitator logs.
- Keep demo state deterministic.
- Fail closed on unknown merchant, unknown category, invalid hash, and expired challenge.

## 17. Worktree Parallelization Strategy

| Workstream | Modules touched | Depends on |
|---|---|---|
| Shared contract | packages/permit402-shared, root config | none |
| Sourabh frontend mock | apps/web, shared contract | shared contract |
| Sourabh x402 merchants | services/merchants, services/agent, shared contract | shared contract |
| Sourabh LI.FI funding | apps/web/lib/lifi, services/mirror | frontend scaffold |
| Teammate Anchor program | programs/permit402, tests | shared contract |
| Integration adapter | apps/web/lib/permit402, services/facilitator | frontend mock and Anchor IDL |
| Submission docs | README.md, docs/submission | live integration evidence |

Parallel lanes:

- Lane A: shared contract -> frontend mock -> LI.FI funding.
- Lane B: shared contract -> x402 merchants -> facilitator shim.
- Lane C: shared contract -> Anchor program -> tests -> devnet deploy.
- Lane D: after A+B+C merge, integration adapter -> final demo.

Conflict flags:

- packages/permit402-shared is shared. Keep edits small and reviewed by both people.
- docs/submission/track-fit.md is shared. Assign one editor during final submission.
- apps/web/lib/permit402/adapter.ts is shared. Sourabh owns the interface; teammate requests changes through the shared package.

## 18. Design Choices Locked

| Decision | Choice | Reason |
|---|---|---|
| Program framework | Anchor | Fastest safe path to IDL, tests, and devnet deployment. |
| Core token | Devnet USDC / SPL Token | Matches x402/USDC payment story and token CPI demo. |
| Vault authority | PDA-owned ATA | Makes program the spend authority. |
| Agent authority | Limited signer | Agent can request spends but cannot bypass policy. |
| Rejection artifact | Separate record_blocked_attempt | Solana-correct and demo-visible. |
| Replay guard | Receipt PDA by nonce | Native Solana mechanism judges can understand. |
| Request binding | Store payment_req_hash and settlement hash | Ties receipt to x402 challenge. |
| Frontend sequence | Mock first | Lets Sourabh build immediately. |
| LI.FI role | Funding/route layer | Strong track fit without corrupting core story. |
| ZK | Future work only | No target track and high risk. |
| Stretches | ReceiptGraph, Meter402, Refund402 | Only after core demo works. |

## 19. Not In Scope

- Full ZK credit scoring or private payments: no track fit and high build risk.
- LI.FI wallet history scanning: not a LI.FI capability.
- Mobile app: no target mobile track.
- Swig programmable wallet: useful inspiration, not required for winning target tracks.
- v0, ElevenLabs, Virtuals, NoahAI integrations: no confirmed target prize.
- Production payment processor compliance: beyond hackathon scope.
- Mainnet Solana deployment: devnet satisfies Solana track requirement.
- General-purpose paid API marketplace: distracts from policy vault story.
- Agent reputation or lending: teammate idea can be honored later as a paid merchant, not core.

## 20. Stretch Order

Only after the core demo passes end to end:

1. ReceiptGraph UI:
   - graph: task -> x402 challenge -> Permit402 decision -> Receipt or BlockedAttempt;
   - frontend only;
   - high judge value, low protocol risk.
2. Meter402:
   - add prepaid session account;
   - good Rust depth;
   - useful if x402 per-call latency feels slow.
3. Refund402:
   - escrow payment until output validation;
   - harder but strong demo if time remains.
4. Light Protocol compressed receipts:
   - README future-work note unless all core work is done.

## 21. Completion Gates

Do not submit until every gate is checked.

- [ ] anchor test passes.
- [ ] anchor build passes.
- [ ] program deployed to devnet.
- [ ] program ID recorded in README.
- [ ] frontend typecheck passes.
- [ ] frontend build passes.
- [ ] merchant server starts.
- [ ] demo agent can trigger two payments and three blocks.
- [ ] at least two real Receipt accounts exist.
- [ ] at least three real BlockedAttempt accounts exist.
- [ ] Solscan links open.
- [ ] LI.FI route/quote/widget evidence exists.
- [ ] x402 mode is documented truthfully.
- [ ] README has setup instructions.
- [ ] video is under 3 minutes.
- [ ] live demo URL works.

## 22. Engineering Review Summary

Step 0 scope challenge:

- Complexity is high but required for three target tracks.
- Scope was reduced by cutting ZK, extra sponsor tracks, mobile, Swig, and general marketplace features.

Architecture review findings:

- Critical correction: blocked attempts must be separate successful transactions.
- Critical correction: hosted x402 exact SVM may not settle from PDA vault; plan includes explicit spike and shim path.
- Critical correction: frontend must not depend on Anchor internals.
- Critical correction: LI.FI must remain route/funding, not credit scoring.

Code quality review findings:

- Shared policy-check helper prevents drift between pay_x402 and record_blocked_attempt.
- Shared TypeScript package prevents frontend/backend schema drift.
- Adapter boundary keeps mocks honest and swappable.
- Fixed block reason order keeps tests, UI, and program consistent.

Test review findings:

- Coverage matrix exists for every program instruction and every rejection reason.
- Integration tests explicitly cover success, attacker, replay, and over-cap.
- Playwright checks are required for the user-facing demo.

Performance review findings:

- Keep on-chain account model simple.
- Use fixed-size fields.
- Avoid polling unless needed for demo state.
- Keep services stateless where possible.

Parallelization:

- 4 lanes total.
- 3 lanes can run in parallel after shared contract.
- Final integration is sequential.

## 23. First 10 Commands To Execute When Coding Starts

1. pwd
2. git status --short
3. pnpm init
4. create pnpm-workspace.yaml with apps, services, and packages globs
5. mkdir -p packages/permit402-shared/src
6. mkdir -p apps services programs tests docs/submission
7. npm view @x402/svm version
8. npm view @lifi/sdk version
9. npm view @lifi/widget version
10. curl -fsSL https://x402.org/facilitator/supported

Before any code commit:

- run the relevant local check;
- inspect git diff;
- confirm no unrelated docs or research files were rewritten;
- use the repo commit-message policy.

## 24. Final Build Philosophy

Build the smallest thing that proves the biggest claim:

- not "agent pays API";
- not "wallet dashboard";
- not "bridge widget";
- not "chatbot with payments";
- but "a Solana program that acts as the spending law for autonomous agents."

If a feature does not help a judge see that in under 30 seconds, cut it.

## 25. Prompt-To-Artifact Completion Audit

Objective restated:

- Produce a serious implementation plan for Permit402.
- Use the repo instructions and Permit402 spec.
- Respect the working split: Sourabh codes frontend, x402, LI.FI, and basic UI first; teammate codes Anchor/backend after the shared contract is defined.
- Use the requested planning/review skills where useful.
- Output Markdown artifact files, not code.

Checklist:

| Prompt requirement | Evidence in this artifact |
|---|---|
| Use AGENTS.md | Section 1 lists AGENTS.md as source of truth; track boundaries and ZK constraints are reflected in Sections 3, 10, 19. |
| Read candidate-projects/01-Permit402.md | Section 1 lists it; product pitch, receipt/block demo, and policy vault design are carried through Sections 0, 5, 8, 13. |
| Use GSD-style phase planning | Section 13 breaks execution into dependency-ordered phases with owners, files, steps, and validation. |
| Use writing-plans structure | Header follows the required plan format; tasks use checkbox syntax; file responsibilities are listed before phases. |
| Use plan engineering review | Sections 3, 14, 15, 17, and 22 include scope challenge, test coverage, failure modes, parallelization, and engineering review summary. |
| Sourabh codes first | Phases 0-3 are Sourabh-owned and unblock frontend/x402/LI.FI before Anchor exists. |
| Teammate codes backend later | Phases 4-5 assign Anchor program, tests, IDL, and deploy to teammate. |
| Basic frontend at beginning | Phase 2 builds mock-adapter frontend before protocol integration. |
| Sourabh owns x402 | Phase 1 and Section 9 assign x402 merchant, client, facilitator, and demo-agent work to Sourabh. |
| Use Solana constraints correctly | Sections 2, 8, 14, and 21 cover Anchor, PDAs, SPL Token CPI, devnet deploy, Receipt replay guard, and BlockedAttempt artifacts. |
| Use LI.FI correctly | Section 10 uses LI.FI for quote/route/widget/funding and rejects credit-history claims. |
| Include every major design choice | Sections 2, 8, 9, 10, 11, 12, 18, and 19 lock architecture, authority, x402, LI.FI, UI, team split, and cuts. |
| Include architecture plan | Section 5 provides component and payment decision diagrams. |
| Include execution plan | Section 13 provides phase-by-phase execution with owners, files, steps, commands, and validation. |
| Include review and risk analysis | Sections 14, 15, 16, 21, and 22 cover tests, failure modes, reliability, completion gates, and engineering review. |
| Output Markdown file | This file is docs/superpowers/plans/2026-05-09-permit402-implementation-plan.md. |
| Do not code yet | Only documentation under docs/superpowers/plans was added for this objective. |

Artifact self-check:

- Placeholder scan target terms: standard forbidden placeholder phrases.
- Expected scan result: no matches.
- Current plan length target: enough detail to hand to two implementers without rereading the entire ideation corpus.
- Remaining uncertainty: x402 hosted exact settlement from a PDA vault must be tested during Phase 1 before README wording is finalized.

## 26. Second-Pass Review Addendum

Review pass performed after the initial artifact:

- Re-read the plan against AGENTS.md, Permit402 spec, GSD-style phase planning, gstack engineering review criteria, Solana Anchor guidance, x402 guidance, and LI.FI guidance.
- Ran web search against current x402, LI.FI, and Anchor sources.
- Patched concrete plan mistakes instead of leaving them as caveats.

Applied corrections:

| Finding | Correction |
|---|---|
| UnauthorizedAgent was listed as a block reason, but record_blocked_attempt required the signer to already be agent_authority or keeper_authority. | Split attempted_authority from recorder. Unauthorized attempted keys can now be recorded, and keeper can record observed unauthorized attempts. |
| PaymentRequestHashMismatch sounded like the program could independently fetch or parse HTTP challenge data. | Clarified that the program stores/binds hashes; keeper/facilitator verifies HTTP challenge data and only keeper can record mismatch artifacts. |
| Shared BlockReason order did not match the protocol reason priority. | Reordered shared list to match Section 8.5 exactly. |
| x402 hosted exact mode could be misread as guaranteed compatible with a PDA vault. | Added hosted exact compatibility checklist and warning that exact SVM validates TransferChecked while PDA vault spending normally needs Anchor CPI signer seeds. |
| LI.FI section did not explicitly name Solana route identifiers or devnet limitation. | Added SOL / chainTypes=SVM / chain id 1151111081099710 guidance and made the mainnet-widget/devnet-mirror boundary explicit. |
| Tests did not isolate keeper-recorded unauthorized/mismatch paths. | Added dedicated tests for unapproved attempted_authority, keeper-recorded rejection, and keeper-only PaymentRequestHashMismatch. |

External sources checked:

- x402 SVM npm package: https://www.npmjs.com/package/@x402/svm
- x402 exact SVM spec: https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_svm.md
- LI.FI SDK overview: https://docs.li.fi/sdk/overview
- LI.FI request routes/quotes: https://docs.li.fi/sdk/request-routes
- LI.FI Solana API examples: https://docs.li.fi/li.fi-api/solana/request-examples
- Anchor token transfer with PDA owner: https://book.anchor-lang.com/docs/tokens/basics/transfer-tokens

Second-pass result:

- The plan is stronger after review.
- The remaining biggest risk is still x402 settlement mode, and it is now isolated as the first technical spike instead of hidden inside later integration work.
