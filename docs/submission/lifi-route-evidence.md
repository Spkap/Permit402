# LI.FI Route Evidence

Updated: 2026-05-10

## Repeatable Check

```sh
pnpm --filter @permit402/web lifi:quote
```

This calls `@lifi/sdk@3.16.3` with integrator `permit402` and requests a quote for:

| Field | Value |
|---|---|
| Source | Base, chain id `8453` |
| Destination | Solana, chain id `1151111081099710` |
| Source token | Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Destination token | Solana mainnet USDC `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Amount | `5 USDC` |
| Order | `CHEAPEST` |
| Slippage | `0.5%` |

## Latest Observed Result

Observed locally on 2026-05-10:

```json
{
  "checkedAt": "2026-05-10T04:41:16.023Z",
  "routeCount": 4,
  "bestRoute": {
    "id": "27850730-67b6-40be-9245-67a12ae39beb",
    "toolKey": "mayan",
    "toolName": "Mayan (Swift)",
    "fromAmount": "5 USDC",
    "toAmount": "4.971832 USDC",
    "toAmountUSD": "4.9701"
  }
}
```

## What This Proves

- LI.FI can quote a real Base USDC to Solana USDC route for the Permit402 funding surface.
- The `/fund` page now attempts this same live SDK quote server-side and falls back honestly if the API is unavailable.

## What This Does Not Prove Yet

- No wallet transaction was signed or executed.
- No Solana devnet Permit402 vault was funded by this route.
- The destination token above is Solana mainnet USDC. The hackathon devnet demo still needs the planned mirror step before claiming a completed LI.FI-funded devnet vault.
