import { serve } from "@hono/node-server";
import { Hono } from "hono";

const PORT = Number(process.env.PORT ?? 4022);

const app = new Hono();
const seen = new Set<string>();

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "permit402-facilitator",
    mode: process.env.X402_MODE ?? "shim-mock",
  }),
);

app.post("/preflight", async (c) => {
  const body = (await c.req.json()) as {
    policy?: string;
    nonce?: string;
    paymentReqHash?: string;
    merchant?: string;
  };
  if (!body.policy || !body.nonce || !body.paymentReqHash || !body.merchant) {
    return c.json(
      {
        ok: false,
        error: "missing policy, nonce, merchant, or paymentReqHash",
      },
      400,
    );
  }

  const key = `${body.policy}:${body.nonce}:${body.paymentReqHash}`;
  if (seen.has(key)) {
    return c.json(
      { ok: false, decision: "blocked", reason: "ReceiptAlreadyExists" },
      409,
    );
  }
  seen.add(key);
  return c.json({ ok: true, decision: "allowed", mode: "shim-mock" });
});

export default app;

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port: PORT });
  console.log(`permit402 facilitator listening on http://localhost:${PORT}`);
}
