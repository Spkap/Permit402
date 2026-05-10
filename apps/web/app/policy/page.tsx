import { getPermit402Mode } from "../../lib/permit402/adapter";

export default function PolicyPage() {
  const mode = getPermit402Mode();

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Policy</p>
          <h1>Create policy</h1>
        </div>
      </section>
      <section className="panel">
        <h2>Mock Policy Form</h2>
        <p className="muted">
          Current mode: {mode}. Anchor adapter wiring lands after devnet
          redeploy and IDL handoff.
        </p>
      </section>
    </main>
  );
}
