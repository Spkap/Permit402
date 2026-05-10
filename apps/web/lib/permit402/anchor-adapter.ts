import type { Permit402Adapter, Permit402Mode } from "./adapter";

interface AnchorAdapterOptions {
  mode: Exclude<Permit402Mode, "mock">;
}

const REQUIRED_ENV = [
  "NEXT_PUBLIC_PERMIT402_PROGRAM_ID",
  "NEXT_PUBLIC_SOLANA_RPC_URL",
  "NEXT_PUBLIC_PERMIT402_POLICY",
];

export function createAnchorPermit402Adapter({
  mode,
}: AnchorAdapterOptions): Permit402Adapter {
  return {
    mode,
    async getPolicyState() {
      const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
      const suffix =
        missing.length > 0 ? " Missing env: " + missing.join(", ") + "." : "";

      throw new Error(
        "Permit402 " +
          mode +
          " adapter is not wired yet. Add the Anchor account reader before using this mode." +
          suffix,
      );
    },
  };
}
