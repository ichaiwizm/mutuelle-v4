import { useParams, useNavigate } from "react-router-dom";
import { RunLiveView } from "@/renderer/features/automation/components/live";

export function RunLivePage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  if (!runId) {
    navigate("/automation");
    return null;
  }

  return <RunLiveView runId={runId} onBack={() => navigate("/automation")} />;
}
