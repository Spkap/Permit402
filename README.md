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
|-- README.md
|-- techstack.md
|-- candidate-projects/
|   +-- 01-Permit402.md
+-- docs/
    |-- permit402-plan.md
    |-- hackathon-tracks/
    |   |-- lifi-track.md
    |   |-- resources.md
    |   +-- solana-track.md
    |-- research/
    |   |-- integration-spec.md
    |   |-- prize-matrix.md
    |   +-- winner-patterns.md
    +-- superpowers/
        +-- plans/
            +-- 2026-05-09-permit402-implementation-plan.md
~~~

## Verified Stack

~~~text
@coral-xyz/anchor@0.32.1
@x402/svm@2.11.0
@lifi/sdk@3.16.3
@lifi/widget@3.40.12
@solana/kit@6.9.0
helius-sdk
next@15
tailwindcss@4
~~~

## First Build Gate

Before coding deep integration, verify x402 facilitator behavior:

~~~bash
curl -fsSL https://x402.org/facilitator/supported
npm view @x402/svm version
pnpm --filter @permit402/facilitator x402:supported
~~~

The implementation plan treats hosted x402 exact SVM compatibility with a PDA vault as an explicit spike, not an assumption.

## LI.FI Route Check

The funding page uses `@lifi/sdk` to request a live Base USDC to Solana USDC route quote at runtime and falls back if LI.FI is unavailable. Re-run the quote evidence with:

~~~bash
pnpm --filter @permit402/web lifi:quote
~~~

This is quote evidence only. It does not mean a wallet transaction was executed or that the devnet Permit402 vault has been funded.
