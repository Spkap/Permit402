# Permit402 Track Fit

Generated/updated: 2026-05-09

## Target Tracks

| Track | Fit | Current evidence |
|---|---|---|
| Solana Best App Overall | Permit402 is a unique Anchor/Rust policy vault. The Rust program is intended to enforce payment policy before a PDA-owned USDC vault can spend. | programs/permit402 exists; docs/submission/program-addresses.md records devnet program ID `GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S`. Latest local handler changes still need build/test/redeploy verification. |
| x402 Bonus on Solana | Permit402 uses x402 as the paid API challenge/payment layer, with the Solana program enforcing whether the agent is allowed to pay. | Live facilitator check on 2026-05-09 showed x402 v2 exact on `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` and x402 v1 exact on `solana-devnet`; package versions are `@x402/svm@2.11.0` and `@x402/core@2.11.0`. PDA-vault settlement mode still needs a spike before final README wording. |
| LI.FI Cross-Chain Solana UX | LI.FI should fund or route value into the Solana Permit402 vault, not provide wallet history or credit scoring. | Live npm checks on 2026-05-09 matched the plan: `@lifi/sdk@3.16.3`, `@lifi/widget@3.40.12`. The web app now attempts a live Base USDC -> Solana USDC LI.FI SDK quote on `/fund`; repeatable evidence is in `docs/submission/lifi-route-evidence.md`. Wallet execution and devnet mirror evidence are still pending. |

## x402 Facilitator Evidence

Command run:

```sh
curl -fsSL https://x402.org/facilitator/supported
```

Relevant observed support:

- x402 v2 exact on `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`
- x402 v1 exact on `solana-devnet`
- Solana fee payer: `CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5`

Important limitation:

- This proves facilitator advertised support, not that hosted exact SVM can settle directly from a Permit402 PDA-owned vault. The plan still requires a hosted-vs-shim spike before claiming the final x402 mode.

## Package Version Evidence

Command results on 2026-05-09:

```text
npm view @x402/svm version      -> 2.11.0
npm view @x402/core version     -> 2.11.0
npm view @lifi/sdk version      -> 3.16.3
npm view @lifi/widget version   -> 3.40.12
```

## Not Claiming Yet

- No claim that the latest local program handlers are deployed to devnet.
- No claim that Anchor build/test passes in this environment.
- No claim that LI.FI bridge/funding transaction execution is implemented.
- Current /fund UI is a live LI.FI route quote when the API responds, with fallback if unavailable; it is not a completed devnet-vault bridge.
- No claim that hosted x402 settles from the Permit402 PDA vault.
- No claim that demo video, live demo URL, Receipt accounts, or BlockedAttempt accounts are ready.
