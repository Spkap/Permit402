import {
  BLOCK_REASON,
  BLOCK_REASON_LABEL,
  solscanAccountUrl,
} from "@permit402/shared";

type DemoOutcome = "paid" | "blocked";

interface DemoStep {
  name: string;
  path: string;
  nonce: number;
  outcome: DemoOutcome;
  reason?: number;
  amount: string;
}

const merchantBaseUrl =
  process.env.MERCHANT_BASE_URL ?? "http://localhost:4021";
const programId =
  process.env.PERMIT402_PROGRAM_ID ??
  "GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S";

const steps: Array<DemoStep> = [
  {
    name: "research.api",
    path: "/research",
    nonce: 1,
    outcome: "paid",
    amount: "2.00 USDC",
  },
  {
    name: "translate.api",
    path: "/translate",
    nonce: 2,
    outcome: "paid",
    amount: "1.00 USDC",
  },
  {
    name: "attacker.api",
    path: "/attacker",
    nonce: 101,
    outcome: "blocked",
    reason: BLOCK_REASON.MerchantNotAllowed,
    amount: "4.00 USDC",
  },
  {
    name: "replay",
    path: "/research",
    nonce: 1,
    outcome: "blocked",
    reason: BLOCK_REASON.ReceiptAlreadyExists,
    amount: "2.00 USDC",
  },
  {
    name: "over-cap",
    path: "/research",
    nonce: 102,
    outcome: "blocked",
    reason: BLOCK_REASON.PerCallCapExceeded,
    amount: "12.00 USDC",
  },
];

async function fetchChallenge(step: DemoStep) {
  const url = new URL(step.path, merchantBaseUrl);
  url.searchParams.set("nonce", String(step.nonce));
  const res = await fetch(url);
  if (res.status !== 402) {
    throw new Error(
      `${step.name} expected HTTP 402 challenge, got ${res.status}`,
    );
  }
  const body = (await res.json()) as {
    accepts?: Array<{ paymentReqHash?: string }>;
  };
  const paymentReqHash = body.accepts?.[0]?.paymentReqHash;
  if (!paymentReqHash) {
    throw new Error(`${step.name} challenge did not include paymentReqHash`);
  }
  return paymentReqHash;
}

async function run() {
  const results = [];
  for (const step of steps) {
    const paymentReqHash = await fetchChallenge(step);
    if (step.outcome === "paid") {
      const paidUrl = new URL(step.path, merchantBaseUrl);
      paidUrl.searchParams.set("nonce", String(step.nonce));
      const paid = await fetch(paidUrl, {
        headers: {
          "PAYMENT-SIGNATURE": `mock-permit402:${paymentReqHash}`,
        },
      });
      if (!paid.ok) {
        throw new Error(`${step.name} paid retry failed with ${paid.status}`);
      }
      const paymentResponse = paid.headers.get("PAYMENT-RESPONSE");
      if (paymentResponse !== paymentReqHash) {
        throw new Error(
          `${step.name} paid retry returned invalid PAYMENT-RESPONSE`,
        );
      }
    }
    results.push({
      step: step.name,
      outcome: step.outcome,
      amount: step.amount,
      nonce: step.nonce,
      reason:
        step.reason === undefined ? null : BLOCK_REASON_LABEL[step.reason],
      paymentReqHash,
      solscan: solscanAccountUrl(programId),
    });
  }

  console.log(
    JSON.stringify({ mode: "mock-local", programId, results }, null, 2),
  );
}

await run();
