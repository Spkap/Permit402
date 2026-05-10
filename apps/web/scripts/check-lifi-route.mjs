import { createConfig, getRoutes } from "@lifi/sdk";

const request = {
  fromChainId: 8453,
  toChainId: 1_151_111_081_099_710,
  fromTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  toTokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  fromAmount: "5000000",
  fromAddress: "0x0000000000000000000000000000000000000001",
  toAddress: "11111111111111111111111111111111",
  options: {
    order: "CHEAPEST",
    slippage: 0.005,
    maxPriceImpact: 0.3,
  },
};

createConfig({
  integrator: "permit402",
  preloadChains: false,
});

function formatUsdc(baseUnits, decimals = 6) {
  const amount = BigInt(baseUnits);
  const scale = 10n ** BigInt(decimals);
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(decimals, "0");
  const trimmed = fraction.replace(/0+$/, "");

  return whole.toString() + (trimmed ? "." + trimmed : "") + " USDC";
}

const result = await getRoutes(request);
const route = result.routes?.[0];
const step = route?.steps?.[0];

if (!route || !step) {
  throw new Error("LI.FI returned no Base USDC -> Solana USDC route");
}

console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      routeCount: result.routes.length,
      request,
      bestRoute: {
        id: route.id,
        toolKey: step.tool,
        toolName: step.toolDetails.name,
        fromAmount: formatUsdc(route.fromAmount),
        toAmount: formatUsdc(route.toAmount, step.action.toToken.decimals),
        toAmountUSD: route.toAmountUSD,
      },
      unavailableRoutes: result.unavailableRoutes,
      caveat:
        "Quote only. No transaction was executed, and this does not fund the devnet Permit402 vault without a separate mainnet-to-devnet mirror step.",
    },
    null,
    2,
  ),
);
