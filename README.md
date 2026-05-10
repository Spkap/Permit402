# Permit402

**Agents should not get wallets. They should get allowances.**

Permit402 is a Solana policy vault for autonomous x402 payments. Users fund a PDA-owned USDC vault, approve merchants, set spend limits, and let agents operate inside those boundaries. The agent can request a payment, but the Solana program decides whether that payment is allowed.

The result is a safer primitive for agent commerce: autonomous payments without handing an agent an open wallet.

Built for the Dev3pack Global Hackathon, May 8-10 2026.

## The Problem

x402 gives agents a clean way to pay for APIs and services. That unlocks useful workflows, but it creates a hard trust problem: once an agent can spend from a wallet, every prompt injection, malicious page, replayed request, or buggy tool call can become a real payment.

Most demos solve this in the UI. Permit402 solves it in the program.

## The Idea

Permit402 turns agent spend into an allowance system.

A user defines the policy once:

- which agent is allowed to act;
- which merchants are approved;
- how much can be spent per call;
- how much each merchant can receive;
- how much each category can consume;
- how much can be spent per day;
- when the policy expires.

Then every paid request goes through the same rule: if the payment fits the policy, it can proceed; if it does not, the rejection is recorded.

## How It Works

1. A merchant returns an x402 payment requirement.
2. The agent prepares a payment attempt for that exact request.
3. Permit402 checks the agent, merchant, amount, category, daily budget, expiry, nonce, and request hash.
4. Allowed payments create Receipt accounts.
5. Rejected attempts create BlockedAttempt accounts.

That means the demo is not just "an agent paid an API." The demo shows an agent trying to spend, and an on-chain policy deciding whether it is allowed.

## Why It Wins

| Track | Why Permit402 Fits |
|---|---|
| Solana Best App Overall | The Rust program is the product. It uses PDAs, SPL Token CPI, clock-based budgets, typed accounts, nonce replay protection, and auditable on-chain artifacts. |
| x402 Bonus on Solana | Permit402 adds the missing safety layer for x402 agent payments: policy-gated spend instead of direct wallet authority. |
| LI.FI Cross-Chain Solana UX | LI.FI provides the funding route into the Solana app. The current build verifies live Base USDC -> Solana USDC route quotes. |

## Devnet Program

| Item | Value |
|---|---|
| Program ID | `GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S` |
| Solscan | https://solscan.io/account/GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S?cluster=devnet |
| ProgramData | `AiTUcdVPjN5drLtUZgmneAjLuZxQK8NqpXCd2JTDM6px` |
| Upgrade authority | `CNsRQSWn25dWAjWKs2eqMPwugJD5EfGaB6mWbQGv78AT` |
| Last verified | 2026-05-10 with `solana program show ... --url devnet` |

The existing `GiZNZ...` program is verified on devnet. The latest local implementation is validated with Anchor tests. A fresh redeploy of the latest local handlers is not claimed unless the matching program signer and upgrade authority are available.

## Policy Checks

The core `pay_x402` path enforces:

- approved `agent_authority`;
- merchant allowlist through `MerchantBinding`;
- per-call cap;
- per-merchant cap;
- category cap;
- total vault cap;
- daily cap with clock-based reset;
- policy expiry;
- replay protection through Receipt PDA collision;
- x402 request-hash binding.

Blocked attempts can be recorded with reason codes such as:

- `MerchantNotAllowed`;
- `ReceiptAlreadyExists`;
- `PerCallCapExceeded`;
- `PaymentRequestHashMismatch`;
- `PolicyExpired`;
- `UnauthorizedAgent`.

## Demo Narrative

The clearest 3-minute story:

1. Show the Permit402 dashboard and devnet program ID.
2. Show a LI.FI route quote for Base USDC -> Solana USDC funding.
3. Show the user policy: total cap, daily cap, merchant allowlist, category budgets, and per-call limit.
4. Run an agent task that needs paid API calls.
5. Show approved requests producing Receipt artifacts.
6. Show unsafe requests blocked by policy: attacker merchant, replayed nonce, and over-cap spend.
7. End on the dashboard: remaining budget, receipts, blocked attempts, and program link.

Safe current wording: the demo runner is local/mock by default and links to the verified devnet program. Fresh devnet Receipt and BlockedAttempt links should be shown only after those artifacts are generated.

## Current Evidence

| Area | Status | Evidence |
|---|---|---|
| Anchor program | Implemented and locally tested | `anchor test --skip-build` passes with 14 tests |
| Devnet program | Existing `GiZNZ...` program verified on devnet | `docs/submission/program-addresses.md` |
| x402 support | Hosted facilitator advertises Solana devnet exact support | `pnpm --filter @permit402/facilitator x402:supported` |
| x402 settlement | Hosted PDA-vault settlement is not claimed yet | Current demo path uses local facilitator/merchant shim |
| Merchant/agent loop | Merchant verifies mock payment signature; agent verifies `PAYMENT-RESPONSE` | `pnpm --filter @permit402/merchants smoke`; `pnpm --filter @permit402/agent demo` |
| LI.FI | Live Base USDC -> Solana USDC quote works | `pnpm --filter @permit402/web lifi:quote` |
| LI.FI execution/mirror | Not claimed yet | No wallet transaction or devnet mirror funding is recorded |
| Frontend | Next app builds; default mode is mock; real modes are read-only/env-gated | `pnpm --filter @permit402/web build` |
| Submission docs | Demo script, QA checklist, program addresses, and evidence notes exist | `docs/submission/` |

## Repository Layout

~~~text
.
|-- Anchor.toml
|-- apps/
|   +-- web/                 # Next.js demo, funding page, read-only account adapter
|-- docs/
|   |-- permit402-plan.md    # locked product plan and demo script
|   |-- submission/          # evidence, QA, program addresses
|   +-- superpowers/plans/   # implementation and remaining-work plans
|-- packages/
|   +-- permit402-shared/    # categories, block reasons, hashes, Solscan helpers
|-- programs/
|   +-- permit402/           # Anchor/Rust policy vault program
|-- services/
|   |-- agent/               # mock-local demo agent
|   |-- facilitator/         # x402 support checker and preflight shim
|   |-- keeper/              # Permit402 memo helpers
|   +-- merchants/           # x402 challenge merchant endpoints
|-- tests/                   # Anchor integration tests
~~~

## Stack

~~~text
@coral-xyz/anchor@0.31.1
Solana / Anza CLI 2.1.21
platform-tools v1.52
@lifi/sdk@3.16.3
@lifi/widget@3.40.12
next@15.1.6
typescript@5.5.3
~~~

The planned x402 SDK versions are `@x402/svm@2.11.0` and `@x402/core@2.11.0`. The current code uses a local facilitator/merchant shim plus hosted-support verification. It does not claim hosted PDA-vault settlement.

## Quick Start

Install dependencies:

~~~bash
pnpm install
~~~

Use Node 20, Solana active release, and cargo Anchor first in PATH:

~~~bash
export PATH="/opt/homebrew/opt/node@20/bin:/Users/sourabhkapure/.local/share/solana/install/active_release/bin:/Users/sourabhkapure/.cargo/bin:$PATH"
~~~

Build and test the program:

~~~bash
anchor build --no-idl -- --tools-version v1.52
anchor idl build -o target/idl/permit402.json -t target/types/permit402.ts
anchor test --skip-build
~~~

Run the web app:

~~~bash
pnpm --filter @permit402/web dev
~~~

Open:

~~~text
http://127.0.0.1:3000/demo
http://127.0.0.1:3000/fund
~~~

Run the mock x402 merchant and agent flow:

~~~bash
# terminal 1
pnpm --filter @permit402/merchants dev

# terminal 2
MERCHANT_BASE_URL=http://127.0.0.1:4021 pnpm --filter @permit402/agent demo
~~~

## Frontend Environment

Mock mode does not require secrets.

For read-only localnet/devnet mode, set:

~~~bash
NEXT_PUBLIC_PERMIT402_MODE=mock
NEXT_PUBLIC_PERMIT402_PROGRAM_ID=GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S
NEXT_PUBLIC_PERMIT402_POLICY=<policy-vault-pubkey>
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
~~~

Supported modes:

~~~text
mock | localnet | devnet
~~~

## Validation Commands

~~~bash
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
anchor test --skip-build
~~~

Most recent local verification on 2026-05-10:

- `pnpm lint` passed.
- Shared package build, typecheck, and tests passed.
- Merchant and facilitator smoke checks passed.
- Keeper tests and typecheck passed.
- Web typecheck and production build passed.
- LI.FI quote check returned live routes.
- Hosted x402 support check returned Solana devnet exact support.
- `anchor test --skip-build` passed with 14 tests.

## Honest Boundaries

Permit402 does not currently claim:

- latest local handlers freshly redeployed to devnet;
- hosted x402 settlement directly from the Permit402 PDA vault;
- LI.FI wallet transaction execution;
- LI.FI-funded devnet vault mirror;
- fresh devnet Receipt and BlockedAttempt Solscan links;
- final public live demo URL;
- final submitted demo video URL.

See `docs/submission/` for evidence, caveats, and the recording checklist.
