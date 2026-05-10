import "server-only";

import { createConfig, getRoutes } from "@lifi/sdk";

export interface LifiRoutePreview {
  sourceChain: string;
  destinationChain: string;
  fromToken: string;
  toToken: string;
  requestedAmount: string;
  estimatedOutput: string;
  estimatedOutputUsd: string;
  toolKey: string;
  toolName: string;
  status: "live" | "fallback";
  checkedAt: string;
  routeId?: string;
  error?: string;
  note: string;
}

const BASE_CHAIN_ID = 8453;
const SOLANA_CHAIN_ID = 1_151_111_081_099_710;
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const SOLANA_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const QUOTE_AMOUNT_BASE_UNITS = "5000000";
const QUOTE_FROM_ADDRESS = "0x0000000000000000000000000000000000000001";
const QUOTE_TO_ADDRESS = "11111111111111111111111111111111";

let isConfigured = false;

function ensureLifiConfig() {
  if (isConfigured) {
    return;
  }

  createConfig({
    integrator: "permit402",
    preloadChains: false,
  });
  isConfigured = true;
}

function formatUsdc(baseUnits: string | undefined, decimals = 6): string {
  if (!baseUnits) {
    return "unknown USDC";
  }

  const amount = BigInt(baseUnits);
  const scale = 10n ** BigInt(decimals);
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(decimals, "0");
  const trimmed = fraction.replace(/0+$/, "");

  return whole.toString() + (trimmed ? "." + trimmed : "") + " USDC";
}

function fallbackRoutePreview(error?: unknown): LifiRoutePreview {
  return {
    sourceChain: "Base",
    destinationChain: "Solana",
    fromToken: "USDC",
    toToken: "USDC",
    requestedAmount: formatUsdc(QUOTE_AMOUNT_BASE_UNITS),
    estimatedOutput: "pending live quote",
    estimatedOutputUsd: "unknown",
    toolKey: "lifi",
    toolName: "LI.FI",
    status: "fallback",
    checkedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : undefined,
    note: "Live LI.FI quote unavailable. This view is a route-intent fallback, not bridge execution evidence.",
  };
}

export async function getLifiRoutePreview(): Promise<LifiRoutePreview> {
  try {
    ensureLifiConfig();

    const result = await getRoutes({
      fromChainId: BASE_CHAIN_ID,
      toChainId: SOLANA_CHAIN_ID,
      fromTokenAddress: BASE_USDC,
      toTokenAddress: SOLANA_USDC,
      fromAmount: QUOTE_AMOUNT_BASE_UNITS,
      fromAddress: QUOTE_FROM_ADDRESS,
      toAddress: QUOTE_TO_ADDRESS,
      options: {
        order: "CHEAPEST",
        slippage: 0.005,
        maxPriceImpact: 0.3,
      },
    });
    const route = result.routes?.[0];
    const step = route?.steps?.[0];

    if (!route || !step) {
      return fallbackRoutePreview(new Error("LI.FI returned no routes"));
    }

    const toDecimals = step.action.toToken.decimals ?? 6;

    return {
      sourceChain: "Base",
      destinationChain: "Solana",
      fromToken: "USDC",
      toToken: "USDC",
      requestedAmount: formatUsdc(route.fromAmount, 6),
      estimatedOutput: formatUsdc(route.toAmount, toDecimals),
      estimatedOutputUsd: route.toAmountUSD
        ? "$" + Number(route.toAmountUSD).toFixed(4)
        : "unknown",
      toolKey: step.tool,
      toolName: step.toolDetails.name,
      status: "live",
      checkedAt: new Date().toISOString(),
      routeId: route.id,
      note: "Live LI.FI SDK route quote. Execution still requires a connected wallet and a mainnet-to-devnet mirror before it can be claimed as vault funding.",
    };
  } catch (error) {
    return fallbackRoutePreview(error);
  }
}
