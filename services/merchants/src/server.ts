import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { CATEGORY, paymentReqHash, toHex } from "@permit402/shared";

const PORT = Number(process.env.PORT ?? 4021);
const DEMO_MERCHANT_WALLET =
  process.env.DEMO_MERCHANT_WALLET ?? "11111111111111111111111111111112";
const DEMO_MERCHANT_ATA =
  process.env.DEMO_MERCHANT_ATA ?? "11111111111111111111111111111113";

interface MerchantRoute {
  id: string;
  path: string;
  category: number;
  amountBaseUnits: bigint;
  description: string;
}

const routes: Array<MerchantRoute> = [
  {
    id: "research",
    path: "/research",
    category: CATEGORY.RESEARCH,
    amountBaseUnits: 2_000_000n,
    description: "Research API result",
  },
  {
    id: "translate",
    path: "/translate",
    category: CATEGORY.TRANSLATE,
    amountBaseUnits: 1_000_000n,
    description: "Translation API result",
  },
  {
    id: "attacker",
    path: "/attacker",
    category: CATEGORY.RESEARCH,
    amountBaseUnits: 4_000_000n,
    description: "Untrusted merchant challenge",
  },
];

const app = new Hono();

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "permit402-merchants",
    x402Mode: process.env.X402_MODE ?? "challenge-only",
  }),
);

for (const route of routes) {
  app.get(route.path, (c) => {
    const paid = c.req.header("PAYMENT-SIGNATURE");
    const nonce = BigInt(c.req.query("nonce") ?? "1");
    const requestExpiresAt = Number(
      c.req.query("expiresAt") ?? Math.floor(Date.now() / 1000) + 600,
    );
    const url = new URL(c.req.url);
    const paymentHash = paymentReqHash({
      method: "GET",
      url: `${url.origin}${route.path}`,
      merchantWallet: DEMO_MERCHANT_WALLET,
      merchantAta: DEMO_MERCHANT_ATA,
      amountBaseUnits: route.amountBaseUnits,
      category: route.category,
      nonce,
      requestExpiresAt,
    });

    if (!paid) {
      return c.json(
        {
          error: "PAYMENT_REQUIRED",
          route: route.id,
          accepts: [
            {
              scheme: "exact",
              network: process.env.X402_NETWORK ?? "solana-devnet",
              amountBaseUnits: route.amountBaseUnits.toString(),
              asset: "USDC",
              payTo: DEMO_MERCHANT_WALLET,
              merchantAta: DEMO_MERCHANT_ATA,
              category: route.category,
              nonce: nonce.toString(),
              requestExpiresAt,
              paymentReqHash: toHex(paymentHash),
            },
          ],
        },
        402,
        {
          "PAYMENT-REQUIRED": toHex(paymentHash),
        },
      );
    }

    return c.json({
      ok: true,
      route: route.id,
      description: route.description,
      paymentReqHash: toHex(paymentHash),
    });
  });
}

export default app;

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port: PORT });
  console.log(
    `permit402 merchant server listening on http://localhost:${PORT}`,
  );
}
