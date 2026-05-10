import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Permit402 Demo",
  description: "Policy vault demo for autonomous x402 payments on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
