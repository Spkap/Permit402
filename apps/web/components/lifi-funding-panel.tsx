import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Route,
  WalletCards,
} from "lucide-react";
import { getLifiRoutePreview } from "../lib/lifi/route-preview";

export async function LifiFundingPanel() {
  const route = await getLifiRoutePreview();
  const isLive = route.status === "live";

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
          <span>Input amount</span>
          <strong>{route.requestedAmount}</strong>
        </div>
        <div>
          <Route size={18} />
          <span>Estimated Solana credit</span>
          <strong>{route.estimatedOutput}</strong>
        </div>
        <div>
          {isLive ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>Quote status</span>
          <strong>{isLive ? "live LI.FI quote" : "fallback"}</strong>
        </div>
        <div>
          <ArrowRightLeft size={18} />
          <span>Route tool</span>
          <strong>{route.toolName}</strong>
        </div>
      </div>
      <div className="route-evidence">
        <div>
          <span>USD estimate</span>
          <strong>{route.estimatedOutputUsd}</strong>
        </div>
        <div>
          <span>Route id</span>
          <strong>{route.routeId ?? "not available"}</strong>
        </div>
      </div>
      <p className="muted">{route.note}</p>
      {route.error ? <p className="muted warning">{route.error}</p> : null}
    </section>
  );
}
