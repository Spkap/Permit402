const FACILITATOR_SUPPORTED_URL =
  process.env.X402_FACILITATOR_SUPPORTED_URL ??
  "https://x402.org/facilitator/supported";

interface SupportedKind {
  x402Version: number;
  scheme: string;
  network: string;
  extra?: Record<string, unknown>;
}

interface SupportedResponse {
  kinds?: Array<SupportedKind>;
  extensions?: Array<string>;
  signers?: Record<string, Array<string>>;
}

function findKind(kinds: Array<SupportedKind>, query: SupportedKind) {
  return kinds.find(
    (kind) =>
      kind.x402Version === query.x402Version &&
      kind.scheme === query.scheme &&
      kind.network === query.network,
  );
}

const res = await fetch(FACILITATOR_SUPPORTED_URL);
if (!res.ok) {
  throw new Error(
    `x402 facilitator support check failed with HTTP ${res.status}`,
  );
}

const body = (await res.json()) as SupportedResponse;
const kinds = body.kinds ?? [];
const solanaV2Exact = findKind(kinds, {
  x402Version: 2,
  scheme: "exact",
  network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
});
const solanaV1Exact = findKind(kinds, {
  x402Version: 1,
  scheme: "exact",
  network: "solana-devnet",
});

if (!solanaV2Exact) {
  throw new Error("x402 facilitator did not advertise Solana devnet v2 exact");
}

console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      facilitatorSupportedUrl: FACILITATOR_SUPPORTED_URL,
      solana: {
        v2Exact: solanaV2Exact,
        v1Exact: solanaV1Exact ?? null,
        signers: body.signers?.["solana:*"] ?? [],
      },
      extensions: body.extensions ?? [],
      caveat:
        "Support advertisement only. This does not prove hosted settlement from a Permit402 PDA-owned vault; that still needs a signed integration spike or local facilitator shim.",
    },
    null,
    2,
  ),
);
