# Solana-hack Agent Instructions

These instructions apply to the entire Solana-hack repository.

## Current Hackathon Target

- Hackathon: Dev3pack Global Hackathon, May 8-10 2026.
- Primary project: Permit402 unless the user explicitly changes direction.
- Confirmed target tracks:
  - Solana Best App Overall: unique Rust Solana program deployed at least to devnet.
  - x402 Bonus on Solana: best use of x402 on Solana.
  - LI.FI Cross-Chain Solana UX: real LI.FI quote, route, swap, bridge, or agent-assisted transaction flow.
- Do not assume unverified sponsor tracks or prizes. Current plan excludes v0, ElevenLabs, Solana Mobile, Virtuals, NoahAI, and Swig as prize targets unless the user reopens them.

## Source-Of-Truth Docs

Read these before changing architecture or implementation:

- README.md - current repo overview and target stack.
- docs/permit402-plan.md - locked Permit402 plan and demo script.
- techstack.md - canonical versions and implementation choices.
- candidate-projects/01-Permit402.md - full product/protocol spec.
- docs/hackathon-tracks/solana-track.md - Solana track requirements.
- docs/hackathon-tracks/lifi-track.md - LI.FI track requirements.
- docs/hackathon-tracks/resources.md - official hackathon resource list.
- docs/research/ - prior research, integration spec, winner patterns, and prize matrix.

## Solana Track Requirements

For Solana Best App submissions:

- Build a unique Solana program written in Rust using Anchor, Pinocchio, Quasar, or vanilla Rust.
- Deploy at least to devnet.
- Put contract/program deployment addresses in the README.
- Keep the GitHub repo public with setup instructions.
- Provide a live demo link and demo video under 3 minutes.
- Favor visible, meaningful Solana usage: PDAs, SPL Token CPI, clock sysvar, replay protection, typed accounts, and clean client usage.

## Permit402 Implementation North Star

Permit402 should remain simple to explain and real underneath:

> Agents should not get wallets. They should get allowances.

The Rust program is the product. It must enforce policy, not merely log frontend decisions.

Core policy checks:

- approved agent_authority;
- merchant allowlist via MerchantBinding;
- per-call cap;
- per-merchant cap;
- category cap;
- total vault cap;
- daily cap;
- policy expiry;
- unused nonce via Receipt PDA collision;
- x402 request hash binding.

Judge-visible demo artifacts:

- successful Receipt PDAs;
- rejected BlockedAttempt PDAs;
- live vault balance and remaining budget;
- clear Solscan links;
- devnet program ID.

## x402 Guidance

- Use @x402/svm as the Solana x402 SDK unless Day-1 verification proves a different package/version is required.
- Verify hosted facilitator support early with GET https://x402.org/facilitator/supported.
- If hosted devnet USDC support is missing, use the planned local facilitator fallback from @x402/svm/exact/facilitator.
- The winning x402 angle is policy-gated autonomous payments, not simply "agent pays an API."
- In the demo, preflight policy checks must happen before any irreversible SPL transfer is broadcast.

## LI.FI Guidance

Use LI.FI only for what the track and docs reward:

- cross-chain onboarding into the Solana app;
- bridge/swap route quotes;
- payment or checkout flows where sender can start on another chain and the app receives value on Solana;
- AI-agent route discovery or transaction preparation;
- funding the Permit402 vault from non-Solana assets.

LI.FI must be meaningful, not cosmetic. The README must explain the user flow and exactly how LI.FI is integrated.

Do not claim LI.FI scans historical wallet activity or computes credit/reputation. LI.FI is a routing/execution layer for swaps, bridges, payments, liquidity, and related status/quote tooling.

## Official Agentic Skills And AI Resources

Check these before writing custom Solana or agent boilerplate:

- Solana Skills by SendAI: https://www.solanaskills.com/
- Agent Skills - Solana: https://solana.com/skills
- Solana Dev Skill: https://github.com/solana-foundation/solana-dev-skill
- solana.new: https://www.solana.new/
- NoahAI: https://trynoah.ai/
- Awesome Solana AI: https://github.com/solana-foundation/awesome-solana-ai
- LI.FI Agent Skills: https://github.com/lifinance/lifi-agent-skills
- LI.FI MCP Server: https://docs.li.fi/mcp-server/overview

Use these resources to accelerate scaffold, wallet flows, agent tooling, Solana account patterns, and LI.FI route/quote integration. Do not let any tool-generated code override the locked Permit402 architecture without verifying it against docs/permit402-plan.md.

## Installed Local Skills

Relevant Solana hackathon skills have been installed into both shared agent roots:

- /Users/sourabhkapure/.agents/skills
- /Users/sourabhkapure/.claude/skills

Use these local skills before inventing patterns from memory. Restarting Claude/Codex may be required before newly installed skills appear in automatic discovery.

Core Solana/program skills:

- solana-dev-skill
- solana-development
- solana-anchor-claude-skill
- solana-official-quickstart
- solana-official-installation
- solana-developer-resources
- solana-developer-tools-superteam
- solana-playground-solpg
- create-solana-dapp
- solana-developer-templates
- solana-web3js
- solana-kit
- solana-kit-migration
- surfpool
- svm
- pinocchio-development
- solana-security
- vulnhunter
- zz-code-recon

Permit402/x402/payment-relevant skills:

- x402
- quicknode
- quicknode-skill
- metengine
- light-payments
- swig-smart-wallets
- solana-bootcamp-2026

Wallet/frontend skills:

- phantom-connect
- phantom-connect-official
- phantom-connect-official-plugin
- phantom-add-social-login
- phantom-send-sol-transaction
- phantom-sign-message
- phantom-setup-browser-app
- phantom-setup-react-app
- phantom-setup-react-native-app
- phantom-wallet-mcp
- phantom-wallet-mcp-official-plugin
- helius
- helius-phantom

LI.FI/cross-chain skills:

- li-fi-api
- li-fi-sdk
- lifi-widget
- lifi-sdk-official
- lifi-solana-ecosystem
- lifi-brand-guidelines
- debridge

ZK/compression/privacy skills:

- light-protocol
- light-sdk
- light-token-client
- light-solana-compression
- light-zk-nullifier
- light-testing
- solana-compression
- inco

Protocol/ecosystem skills that may be useful for examples or integrations:

- jupiter
- integrating-jupiter
- jupiter-lend
- jupiter-swap-migration
- jupiter-vrfd
- kamino
- lulo
- meteora
- orca
- raydium
- sanctum
- marginfi
- ranger-finance
- glam
- glam-official
- squads
- metaplex
- metaplex-official
- magicblock
- magicblock-official
- pumpfun
- manifest
- lavarage
- pyth
- coingecko
- carbium
- helius-dflow
- dflow
- dflow-phantom-connect
- dflow-phantom-wallet-mcp
- octav-api-skill
- awesome-solana-oss
- noah-ai

Use octav-api-skill only for wallet-history/portfolio style exploration. Do not substitute it for LI.FI routing, and do not claim LI.FI provides historical credit scoring.

## Browser And Research Tooling

Current verified tooling:

- Exa MCP is available in-session as mcp__exa__web_search_exa and mcp__exa__web_fetch_exa.
- browse CLI is installed at /opt/homebrew/bin/browse and successfully opened https://solana.com/docs/intro/quick-start.
- Firecrawl is configured in Codex MCP as firecrawl using npx -y firecrawl-mcp with FIRECRAWL_API_KEY set, but the current Codex session may not expose Firecrawl tools in ALL_TOOLS. If Firecrawl is needed, check codex mcp get firecrawl and available tool names before assuming it is callable.

For web research in this repo:

- Prefer official docs and GitHub repos first.
- Use Exa fetch/search for clean markdown snapshots.
- Use browse when a real browser check, page title, screenshots, or dynamic UI validation matters.
- Do not report Firecrawl output unless Firecrawl was actually invoked in the current session.

## Official Developer Resources

Use these resources when implementing or verifying Solana, wallet, frontend, or LI.FI work:

- Solana Quick Start: https://solana.com/docs/intro/quick-start
- Solana Developer Resources: https://solana.com/developers
- Solana Developers Stack: https://superteam.fun/build/developer-tools
- Solana Browser IDE / Playground: https://beta.solpg.io/
- Create Solana dApp: https://github.com/solana-foundation/create-solana-dapp
- Phantom Connect: https://docs.phantom.com/phantom-connect
- Solana Environment Setup: https://solana.com/docs/intro/installation
- Swig programmable smart wallets: https://build.onswig.com/
- Solana Web3.js: https://github.com/solana-foundation/solana-web3.js
- Solana Developer Bootcamp 2026: https://www.youtube.com/watch?v=2pcm7ICRJKU
- Solana Developer Templates: https://solana.com/developers/templates
- Awesome Solana OSS: https://github.com/StockpileLabs/awesome-solana-oss
- LI.FI Widget: https://docs.li.fi/widget/overview
- LI.FI SDK: https://docs.li.fi/sdk/overview
- LI.FI Solana Ecosystem Coverage: https://docs.li.fi/introduction/solana-ecosystem
- LI.FI Brand Guidelines: https://li.fi/brand-guidelines/

## Build Split

If two people are coding:

- Frontend/x402 owner: Next.js UI, demo runner, x402 mock merchant APIs, agent flow, LI.FI funding UI, Solscan links, and visual polish.
- Protocol/backend owner: Anchor program, tests, IDL, devnet deploy, keeper/backend adapter, policy enforcement, and program-address documentation.

The shared contract lives in types and IDL. Do not create hidden coupling between frontend mocks and protocol internals.

## ZK Position

ZK is not a core track for this hackathon. Do not put ZK, Light Protocol, Arcium, or private payments on the critical path.

Safe use:

- README future-work note for Light Protocol compressed receipts;
- optional policy-risk or score-check merchant as a paid x402 demo endpoint;
- optional score commitment/attestation if the core demo is already stable.

Unsafe use:

- claiming LI.FI scans all wallet history;
- claiming Light Protocol automatically proves private creditworthiness;
- building full ZK lending or private payment rails as the main demo.

## Validation Expectations

Before calling work done:

- Run the relevant tests or checks for the touched area.
- For Anchor work, run focused Anchor/bankrun tests when available.
- For frontend work, run type/build checks when available and validate the demo UI locally.
- For x402/LI.FI work, verify against real SDK/API behavior where practical and document any fallback.
- Never claim devnet deployment, program ID, LI.FI bridge, x402 facilitator support, or tests passed unless actually verified.
