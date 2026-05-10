# x402 Facilitator Evidence

Updated: 2026-05-10

## Repeatable Check

```sh
pnpm --filter @permit402/facilitator x402:supported
```

The script calls `https://x402.org/facilitator/supported` and requires the hosted facilitator to advertise Solana devnet v2 exact support.

## Latest Observed Result

Observed locally on 2026-05-10:

```json
{
  "checkedAt": "2026-05-10T04:46:00.265Z",
  "solana": {
    "v2Exact": {
      "x402Version": 2,
      "scheme": "exact",
      "network": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "extra": {
        "feePayer": "CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5"
      }
    },
    "v1Exact": {
      "x402Version": 1,
      "scheme": "exact",
      "network": "solana-devnet",
      "extra": {
        "feePayer": "CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5"
      }
    },
    "signers": [
      "CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5"
    ]
  }
}
```

## What This Proves

- The hosted x402 facilitator currently advertises Solana devnet exact support for x402 v2.
- The legacy `solana-devnet` v1 exact network is also currently advertised.
- The fee payer/signer advertised for Solana is `CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5`.

## What This Does Not Prove Yet

- It does not prove settlement from a Permit402 PDA-owned vault.
- It does not prove the current merchant/facilitator shim has executed a real x402 settlement.
- The final demo still needs either a signed hosted-settlement spike or a clearly documented local facilitator shim that creates real Permit402 Receipt and BlockedAttempt accounts.
