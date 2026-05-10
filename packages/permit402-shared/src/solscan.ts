export type SolanaCluster = "devnet" | "testnet" | "mainnet-beta" | "localnet";

function clusterQuery(cluster: SolanaCluster): string {
  return cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
}

export function solscanAccountUrl(
  address: string,
  cluster: SolanaCluster = "devnet",
): string {
  return `https://solscan.io/account/${address}${clusterQuery(cluster)}`;
}

export function solscanTxUrl(
  signature: string,
  cluster: SolanaCluster = "devnet",
): string {
  return `https://solscan.io/tx/${signature}${clusterQuery(cluster)}`;
}
