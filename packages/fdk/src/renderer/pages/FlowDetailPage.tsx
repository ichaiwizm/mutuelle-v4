import { useParams, Link } from 'react-router-dom';
import { useFlows } from '../hooks/useFlows';
import { useFlowDetail } from '../hooks/useFlowDetail';
import { LoadingSpinner } from '../components/common';
import { FlowDetailHeader, FlowTabs, StepsView, YamlView } from '../components/flow-detail';

export function FlowDetailPage() {
  const { flowKey } = useParams<{ flowKey: string }>();
  const { flows, loading } = useFlows();
  const { activeTab, setActiveTab, steps, yaml, loadingSteps, loadingYaml } = useFlowDetail(flowKey);

  const flow = flows.find((f) => f.id === flowKey);

  if (loading) return <LoadingSpinner message="Loading flow..." />;

  if (!flow) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Flow not found</h2>
          <p className="mb-4" style={{ color: 'var(--text-muted)' }}>The flow "{flowKey}" doesn't exist in the database.</p>
          <Link
            to="/flows"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
          >
            Back to Flows
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <FlowDetailHeader flow={flow} />
      <FlowTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'steps' && <StepsView steps={steps} loading={loadingSteps} />}
        {activeTab === 'yaml' && <YamlView yaml={yaml} loading={loadingYaml} />}
      </div>
    </div>
  );
}
