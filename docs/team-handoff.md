# Permit402 Team Handoff

## Sourabh Tasks Left

Sourabh owns the frontend, x402 surface, LI.FI funding flow, and final demo wiring.

- Build the Next.js app under `apps/web`.
- Build the main demo/control-room UI with policy status, vault balance, budgets, allowed merchants, receipts, blocked attempts, and Solscan links.
- Implement `Permit402Adapter` and `MockPermit402Adapter` against the shared contract in `@permit402/shared`.
- Add `AnchorPermit402Adapter` after the IDL/client path is ready.
- Build merchant API mocks for `GET /research`, `POST /translate`, `GET /attacker`, and `GET /health`.
- Implement the x402 HTTP 402 challenge builder and canonical payment hash usage.
- Decide final `X402_MODE`: hosted exact if proven safe, otherwise Permit402 facilitator shim.
- Build the facilitator shim if hosted x402 cannot settle safely from the PDA vault.
- Build the LI.FI funding page with route/quote/widget evidence and devnet mirror messaging.
- Add final README/setup/submission text for frontend, x402 mode, LI.FI integration, app URL, and demo video.
- Coordinate with Akshit on final demo merchant identities, endpoint URLs, categories, merchant wallets, and merchant token accounts.

## Sourabh Tasks Done By Us To Make Akshit's Workflow Implementable

These were implemented on the protocol branch/main so Sourabh can start without waiting on more backend scaffolding.

- Created the shared TypeScript contract package at `packages/permit402-shared`.
- Added `@permit402/shared` exports for:
  - `BlockReason` in the same priority/discriminant order as the Rust program.
  - `MerchantCategory`.
  - `PolicyDraft`, `PolicySummary`, `MerchantConfig`, `ReceiptView`, and `BlockedAttemptView`.
  - canonical x402 `paymentReqHash` helpers.
- Added shared package tests for block reason ordering and x402 hash determinism.
- Added `pnpm-workspace.yaml` with workspace globs for `apps`, `services`, and `packages`.
- Refactored Anchor test fixtures to use the shared x402 hash/category contract.
- Deployed the Permit402 program scaffold to devnet:
  - Program ID: `GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S`.
- Implemented the core Anchor instruction handlers so Sourabh has a real on-chain target:
  - `init_config`
  - `create_policy`
  - `fund_policy`
  - `register_merchant`
  - `add_merchant`
  - `revoke_merchant`
  - `set_category_budget`
  - `pay_x402`
  - `record_blocked_attempt`
  - `close_policy`
- Added the shared on-chain `classify_attempt` helper used by both payment and blocked-attempt paths.
- Added a keeper service scaffold under `services/keeper`.
- Added `docs/submission/program-addresses.md` with current program ID and deployment metadata.

## Akshit Tasks Left

Akshit owns the protocol/backend lane and must make the on-chain path real, visible, and integration-ready.

- From WSL, rebuild and upgrade the devnet program after the latest handler implementation:
  ```bash
  anchor build --no-idl -- --tools-version v1.52
  solana program deploy target/deploy/permit402.so \
    --program-id target/deploy/permit402-keypair.json \
    --url devnet
  ```
- Produce or hand-author a usable IDL for Sourabh's `AnchorPermit402Adapter`.
- Run the policy lifecycle flow end to end:
  - initialize config;
  - create policy;
  - fund vault;
  - register merchants;
  - allowlist approved merchants;
  - set category budgets.
- Generate real devnet demo artifacts:
  - at least two successful `Receipt` accounts;
  - at least three `BlockedAttempt` accounts;
  - Solscan links for every artifact.
- Fill the remaining TBD fields in `docs/submission/program-addresses.md`.
- Support Sourabh's adapter integration:
  - PDA derivation rules;
  - account lists for each instruction;
  - token account requirements;
  - error/rejection reason mapping;
  - Solscan URL construction.
- Finish the keeper service after Sourabh finalizes facilitator/x402 mode.
- Verify the final demo flow on devnet before recording:
  - successful payment moves USDC from vault ATA to merchant ATA;
  - blocked attempts move no funds;
  - replay is blocked;
  - over-cap attempt is blocked;
  - unauthorized agent attempt is recorded.
