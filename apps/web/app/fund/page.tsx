import { LifiFundingPanel } from "../../components/lifi-funding-panel";

export default function FundPage() {
  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Funding</p>
          <h1>LI.FI route surface</h1>
        </div>
      </section>
      <LifiFundingPanel />
    </main>
  );
}
