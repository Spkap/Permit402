"use client";

import {
  Activity,
  Ban,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Route,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { solscanAccountUrl } from "@permit402/shared/solscan";
import type { Permit402PolicyState } from "../lib/permit402/adapter";

function SolscanLink({ href }: { href: string }) {
  return (
    <a
      className="icon-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Open Solscan"
    >
      <ExternalLink size={16} />
    </a>
  );
}

export function DemoDashboard({ state }: { state: Permit402PolicyState }) {
  const programCluster = state.mode === "mock" ? "devnet" : state.mode;
  const programSolscan = solscanAccountUrl(state.programId, programCluster);

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Permit402</p>
          <h1>Agents get allowances, not wallets.</h1>
          <p className="hero-copy">
            Solana-enforced spend limits for autonomous x402 payments.
          </p>
        </div>
        <div className="program">
          <span>Verified devnet program</span>
          <strong>
            {state.programId.slice(0, 8)}...{state.programId.slice(-6)}
          </strong>
          <SolscanLink href={programSolscan} />
        </div>
      </section>

      <section className="proof-strip" aria-label="Demo proof points">
        <div>
          <ShieldCheck size={18} />
          <strong>On-chain policy</strong>
          <span>caps, expiry, nonce, request hash</span>
        </div>
        <div>
          <Route size={18} />
          <strong>x402 payment gate</strong>
          <span>allowed payments become receipts</span>
        </div>
        <div>
          <WalletCards size={18} />
          <strong>LI.FI funding route</strong>
          <span>live Base USDC to Solana quote</span>
        </div>
      </section>

      <section className="metrics" aria-label="Policy summary">
        <div className="metric">
          <WalletCards size={20} />
          <span>Vault balance</span>
          <strong>{state.vaultBalance}</strong>
        </div>
        <div className="metric">
          <Activity size={20} />
          <span>Remaining today</span>
          <strong>{state.remainingToday}</strong>
        </div>
        <div className="metric">
          <ShieldCheck size={20} />
          <span>Per-call cap</span>
          <strong>{state.perCallCap}</strong>
        </div>
        <div className="metric">
          <Landmark size={20} />
          <span>Total cap</span>
          <strong>{state.totalCap}</strong>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-title">
            <Route size={18} />
            <h2>Demo Runner</h2>
          </div>
          <div className="timeline">
            {state.timeline.map((item) => (
              <div className="step" key={item.label}>
                {item.status === "paid" ? (
                  <CheckCircle2 className="paid" size={18} />
                ) : item.status === "blocked" ? (
                  <Ban className="blocked" size={18} />
                ) : (
                  <Activity size={18} />
                )}
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <ShieldCheck size={18} />
            <h2>Merchant Allowlist</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Category</th>
                <th>Cap</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {state.merchants.map((merchant) => (
                <tr key={merchant.name}>
                  <td>{merchant.name}</td>
                  <td>{merchant.category}</td>
                  <td>{merchant.cap}</td>
                  <td>
                    <span
                      className={
                        merchant.status === "Allowed" ? "tag ok" : "tag no"
                      }
                    >
                      {merchant.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid bottom">
        <div className="panel">
          <h2>Receipts</h2>
          {state.receipts.map((receipt) => (
            <div className="row" key={receipt.id}>
              <div>
                <strong>{receipt.merchant}</strong>
                <span>
                  nonce {receipt.nonce} · {receipt.amount}
                </span>
              </div>
              <SolscanLink href={receipt.solscan} />
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Blocked Attempts</h2>
          {state.blockedAttempts.map((attempt) => (
            <div className="row" key={attempt.id}>
              <div>
                <strong>{attempt.reason}</strong>
                <span>
                  {attempt.merchant} · nonce {attempt.nonce} · {attempt.amount}
                </span>
              </div>
              <SolscanLink href={attempt.solscan} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
