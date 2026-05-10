import { DemoDashboard } from "../../components/demo-dashboard";
import { getPermit402Adapter } from "../../lib/permit402/adapter";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const state = await getPermit402Adapter().getPolicyState();

  return <DemoDashboard state={state} />;
}
