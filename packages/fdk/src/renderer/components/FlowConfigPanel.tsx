/**
 * Flow Config Panel
 * Left sidebar for configuring flow execution parameters
 */
import { type FlowSource, type FlowInfo } from '../hooks/useFlows';
import { type Lead } from '../hooks/useLeads';
import { SourceToggle } from './config/SourceToggle';
import { SelectField } from './config/SelectField';
import { CredentialsFields } from './config/CredentialsFields';

interface FlowConfigPanelProps {
  flows: FlowInfo[];
  leads: Lead[];
  sourceFilter: FlowSource;
  selectedFlowId: string;
  selectedLeadId: string;
  credentials: { username: string; password: string };
  isRunning: boolean;
  onSourceFilterChange: (source: FlowSource) => void;
  onFlowSelect: (flowId: string) => void;
  onLeadSelect: (leadId: string) => void;
  onCredentialsChange: (credentials: { username: string; password: string }) => void;
}

export function FlowConfigPanel({
  flows,
  leads,
  sourceFilter,
  selectedFlowId,
  selectedLeadId,
  credentials,
  isRunning,
  onSourceFilterChange,
  onFlowSelect,
  onLeadSelect,
  onCredentialsChange,
}: FlowConfigPanelProps) {
  const flowOptions = flows.map((flow) => ({
    value: flow.id,
    label: `${flow.source === 'file' ? '[F] ' : '[DB] '}${flow.name}`,
  }));

  const leadOptions = leads.map((lead) => ({
    value: lead.id,
    label: `${lead.name} (${lead.type})`,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <SourceToggle value={sourceFilter} disabled={isRunning} onChange={onSourceFilterChange} />

      <SelectField
        label="Flow"
        value={selectedFlowId}
        disabled={isRunning}
        placeholder="Select a flow..."
        options={flowOptions}
        onChange={onFlowSelect}
      />

      <SelectField
        label="Test Lead"
        value={selectedLeadId}
        disabled={isRunning}
        placeholder="Select a lead..."
        options={leadOptions}
        onChange={onLeadSelect}
      />

      <CredentialsFields credentials={credentials} disabled={isRunning} onChange={onCredentialsChange} />
    </div>
  );
}
