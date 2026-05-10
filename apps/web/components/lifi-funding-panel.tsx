import { ArrowRightLeft, CheckCircle2, WalletCards } from "lucide-react";
import { getMockLifiRoutePreview } from "../lib/lifi/route-preview";

export function LifiFundingPanel() {
  const route = getMockLifiRoutePreview();

  return (
    <section className="panel funding">
      <div className="panel-title">
        <ArrowRightLeft size={18} />
        <h2>Funding Route</h2>
      </div>
      <div className="route-card">
        <div>
          <span>Source</span>
          <strong>
            {route.sourceChain} · {route.fromToken}
          </strong>
        </div>
        <ArrowRightLeft size={18} />
        <div>
          <span>Destination</span>
          <strong>
            {route.destinationChain} · {route.toToken}
          </strong>
        </div>
      </div>
      <div className="route-meta">
        <div>
          <WalletCards size={18} />
          <span>Estimated vault credit</span>
          <strong>{route.estimatedOutput}</strong>
        </div>
        <div>
          <CheckCircle2 size={18} />
          <span>Status</span>
          <strong>{route.status}</strong>
        </div>
      </div>
      <p className="muted">
        LI.FI packages are installed. The next step is replacing this
        deterministic preview with a live SDK/widget quote and documenting the
        mainnet-to-devnet mirror boundary.
      </p>
    </section>
  );
}
