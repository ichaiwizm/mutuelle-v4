import { useFlows } from '../hooks/useFlows';
import { useLeads } from '../hooks/useLeads';
import { PageHeader } from '../components/common';
import {
  StatCard,
  QuickAction,
  FlowPreviewList,
  FlowIcon,
  LeadIcon,
  RunIcon,
  HistoryIcon,
  SuccessIcon,
  PendingIcon,
} from '../components/dashboard';

export function DashboardPage() {
  const { flows, loading: flowsLoading } = useFlows();
  const { leads, loading: leadsLoading } = useLeads();

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Dashboard" description="Flow Development Kit - Test and debug automation flows" />
      <div className="p-8 space-y-8">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            Overview
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Available Flows" value={flowsLoading ? '...' : flows.length} icon={<FlowIcon />} color="cyan" />
            <StatCard label="Test Leads" value={leadsLoading ? '...' : leads.length} icon={<LeadIcon />} color="green" />
            <StatCard label="Successful Runs" value="—" icon={<SuccessIcon />} color="green" />
            <StatCard label="Pending" value="—" icon={<PendingIcon />} color="yellow" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction to="/run" icon={<RunIcon />} label="Run Flow" description="Execute a flow with test data" />
            <QuickAction to="/history" icon={<HistoryIcon />} label="View History" description="Check past execution results" />
          </div>
        </section>

        <FlowPreviewList flows={flows} loading={flowsLoading} />
      </div>
    </div>
  );
}
