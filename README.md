# Solana-hack

Dev3pack Global Hackathon - May 8-10, 2026.

## Current Project

**Permit402** - agents should not get wallets. They should get allowances.

Permit402 is a Solana policy vault for autonomous x402 payments. A user funds a PDA-owned USDC vault, allowlists merchants, sets spend caps, and the Rust program decides whether an agent payment is allowed. Successful payments create Receipt accounts; rejected attempts create BlockedAttempt accounts.

## Target Tracks

| Track | Target |
|---|---|
| Solana Best App Overall | Unique Rust Solana program deployed at least to devnet |
| x402 Bonus on Solana | Policy-gated autonomous x402 payments |
| LI.FI Cross-Chain Solana UX | Cross-chain route/funding flow into the Solana app |

Do not add unrelated sponsor tracks unless the team explicitly changes strategy.

## Read Order

1. [AGENTS.md](AGENTS.md) - repo rules, track boundaries, and Permit402 implementation north star.
2. [docs/permit402-plan.md](docs/permit402-plan.md) - locked Permit402 product plan and demo script.
3. [candidate-projects/01-Permit402.md](candidate-projects/01-Permit402.md) - full product/protocol spec.
4. [docs/superpowers/plans/2026-05-09-permit402-implementation-plan.md](docs/superpowers/plans/2026-05-09-permit402-implementation-plan.md) - detailed two-person implementation plan.
5. [techstack.md](techstack.md) - canonical stack and versions.
6. [docs/hackathon-tracks/](docs/hackathon-tracks/) - official track requirements.
7. [docs/research/](docs/research/) - supporting research, integration notes, prize matrix, and winner patterns.

## Current Layout

~~~text
.
|-- AGENTS.md
|-- Anchor.toml
|-- README.md
|-- apps/
|   +-- web/                 # Next.js demo, funding page, read-only account adapter
|-- docs/
|   |-- permit402-plan.md
|   |-- submission/          # track fit, evidence, QA, demo script
|   +-- superpowers/plans/   # execution and remaining-work plans
|-- packages/
|   +-- permit402-shared/    # shared categories, block reasons, hashes, Solscan helpers
|-- programs/
|   +-- permit402/           # Anchor/Rust policy vault program
|-- services/
|   |-- agent/               # mock-local demo agent
|   |-- facilitator/         # x402 support checker and preflight shim
|   |-- keeper/              # Permit402 memo helpers
|   +-- merchants/           # x402 challenge merchant endpoints
|-- tests/                   # Anchor integration tests
~~~

## Current Status

| Area | Status | Evidence |
|---|---|---|
| Anchor program | Implemented and locally tested | `anchor test --skip-build` passes with 14 tests when run with the local Node 20/Solana PATH below |
| Devnet deploy | Older program ID is recorded; latest handler redeploy is not recorded | `docs/submission/program-addresses.md` |
| x402 support | Hosted facilitator advertises Solana devnet exact support | `pnpm --filter @permit402/facilitator x402:supported` |
| x402 settlement | Hosted-vs-shim PDA-vault settlement is not proven | `docs/submission/x402-facilitator-evidence.md` |
| Merchant/agent mock loop | Merchant verifies mock payment signature and agent verifies `PAYMENT-RESPONSE` | `pnpm --filter @permit402/merchants smoke`; `pnpm --filter @permit402/agent demo` |
| LI.FI | Live Base USDC -> Solana USDC route quote works | `pnpm --filter @permit402/web lifi:quote` |
| LI.FI execution/mirror | No wallet transaction or devnet mirror funding is recorded | `docs/submission/lifi-route-evidence.md` |
| Frontend | Next app builds; default mode is mock, real modes are read-only/env-gated | `pnpm --filter @permit402/web build` |
| Final submission assets | Live URL, video URL, and sample Receipt/BlockedAttempt Solscan links are still missing | `docs/submission/qa-checklist.md` |

## Verified Local Stack

~~~text
@coral-xyz/anchor@0.31.1
Solana / Anza CLI 2.1.21
platform-tools v1.52
@lifi/sdk@3.16.3
@lifi/widget@3.40.12
next@15.1.6
typescript@5.5.3
~~~

The x402 SDK versions tracked for the submission plan are `@x402/svm@2.11.0` and `@x402/core@2.11.0`; current code still uses a local facilitator/merchant shim rather than claiming hosted PDA-vault settlement.

## Local Setup

Install workspace dependencies:

~~~bash
pnpm install
~~~

On this macOS machine, put Node 20, Solana active release, and cargo Anchor first in PATH before Anchor commands:

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

Run the mock x402 merchant and agent flow in two terminals:

~~~bash
# terminal 1
pnpm --filter @permit402/merchants dev

# terminal 2
MERCHANT_BASE_URL=http://127.0.0.1:4021 pnpm --filter @permit402/agent demo
~~~

## Evidence Commands

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
~~~

## Not Claiming Yet

- No claim that the latest local handlers are redeployed to devnet.
- No claim that hosted x402 settles directly from the Permit402 PDA vault.
- No claim that LI.FI executed a wallet transaction or funded the devnet vault.
- No final live demo URL or demo video URL is recorded.
- Sample Receipt and BlockedAttempt Solscan links are still `_TBD_` in `docs/submission/program-addresses.md`.
