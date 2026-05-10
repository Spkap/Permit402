# Permit402 Demo Script

Updated: 2026-05-10

This is the target under-3-minute submission script. Do not record final video from this script until the devnet artifact checklist in `docs/submission/qa-checklist.md` is green.

## Current Recordable State

| Segment | Current state | Safe wording |
|---|---|---|
| LI.FI funding | `/fund` shows a live Base USDC -> Solana USDC LI.FI SDK route quote when the API responds. | "LI.FI can quote the cross-chain funding route; execution/mirror is not shown yet." |
| x402 support | Hosted facilitator support is verified for Solana devnet v2 exact. | "The hosted facilitator advertises Solana devnet exact support." |
| Permit402 policy demo | `/demo` is currently mock-local UI backed by deterministic local data. | "This is the local demo runner; final video must swap this for real localnet/devnet artifacts before claiming on-chain execution." |
| On-chain artifacts | Local Anchor tests pass, but fresh devnet Receipt/BlockedAttempt Solscan links are not recorded. | Do not claim final on-chain artifact demo until links exist. |

## Final Video Timeline

| Time | Action | Visual evidence required |
|---:|---|---|
| 0:00 | Say: "Agents should not get wallets. They should get allowances." | Permit402 dashboard with program ID visible. |
| 0:08 | Open funding page and show LI.FI route. | Live LI.FI quote or widget route, plus clear note if devnet mirror is used. |
| 0:28 | Show policy settings: total cap, daily cap, merchant allowlist, category budgets, expiry. | Policy PDA or real account view. |
| 0:45 | Start agent task: research plus translation. | Demo runner enters running state. |
| 1:00 | research.api asks for payment and Permit402 allows it. | Receipt PDA #1 plus Solscan account/tx link. |
| 1:15 | translate.api asks for payment and Permit402 allows it. | Receipt PDA #2 plus Solscan account/tx link. |
| 1:35 | Agent attempts attacker.api. Permit402 rejects it. | BlockedAttempt PDA with `MerchantNotAllowed`. |
| 1:55 | Agent retries nonce/payment. Permit402 rejects replay. | BlockedAttempt PDA with `ReceiptAlreadyExists`. |
| 2:15 | Agent tries approved merchant over cap. Permit402 rejects it. | BlockedAttempt PDA with `PerCallCapExceeded`. |
| 2:35 | Show final dashboard. | Two receipts, three blocked attempts, remaining budget, program ID, repo link. |
| 2:52 | Close: "x402 lets agents pay. Permit402 decides whether they are allowed to." | Track-fit slide or dashboard. |

## Final Recording Rules

- Keep the story about enforcement, not wallet abstraction.
- Every claim about devnet, Solscan, x402 settlement, or LI.FI execution needs a visible artifact.
- If the final demo uses a local facilitator shim, say that the shim submits Permit402 instructions and do not call it hosted settlement.
- If LI.FI is quote-only for submission, say quote-only and show the route evidence instead of claiming vault funding.
- Do not record with any `_TBD_` fields remaining in `docs/submission/program-addresses.md` for the artifacts shown in the video.
