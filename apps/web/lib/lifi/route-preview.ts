export interface LifiRoutePreview {
  sourceChain: string;
  destinationChain: string;
  fromToken: string;
  toToken: string;
  estimatedOutput: string;
  tool: string;
  status: "ready" | "needs-wallet" | "mirrored";
}

export function getMockLifiRoutePreview(): LifiRoutePreview {
  return {
    sourceChain: "Base",
    destinationChain: "Solana",
    fromToken: "USDC",
    toToken: "USDC",
    estimatedOutput: "50.00 USDC",
    tool: "LI.FI route preview",
    status: "ready",
  };
}
