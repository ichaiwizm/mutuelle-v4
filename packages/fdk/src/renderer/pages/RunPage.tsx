/**
 * Run Page
 * Execute flows with selected leads and credentials
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFlows } from '../hooks/useFlows';
import { useLeads } from '../hooks/useLeads';
import { useFlowRunner } from '../hooks/useFlowRunner';
import { FlowConfigPanel } from '../components/FlowConfigPanel';
import { FlowExecutionPanel } from '../components/FlowExecutionPanel';
import { ExecutionControls } from '../components/ExecutionControls';

export function RunPage() {
  const [searchParams] = useSearchParams();
  const { flows, loading: flowsLoading, sourceFilter, setSourceFilter } = useFlows();
  const { leads, loading: leadsLoading, getLead } = useLeads();
  const { isRunning, logs, error: runError, run, stop, clearLogs } = useFlowRunner();

  const [selectedFlowId, setSelectedFlowId] = useState(searchParams.get('flow') || '');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  // Set initial flow from URL params
  useEffect(() => {
    const flowParam = searchParams.get('flow');
    if (flowParam && flows.some((f) => f.id === flowParam)) {
      setSelectedFlowId(flowParam);
    }
  }, [searchParams, flows]);

  const selectedFlow = flows.find((f) => f.id === selectedFlowId);
  const canRun = selectedFlowId && selectedLeadId && !isRunning;

  const handleRun = useCallback(async () => {
    if (!selectedFlowId || !selectedLeadId) return;

    const lead = await getLead(selectedLeadId);
    if (!lead) {
      console.error('Failed to load lead');
      return;
    }

    clearLogs();

    await run({
      flowKey: selectedFlowId,
      lead: lead.data,
      credentials: credentials.username ? credentials : undefined,
    });
  }, [selectedFlowId, selectedLeadId, credentials, getLead, clearLogs, run]);

  const handleStop = useCallback(async () => {
    await stop();
  }, [stop]);

  const loading = flowsLoading || leadsLoading;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel - Configuration */}
      <aside
        className="w-80 border-r flex flex-col flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Run Configuration
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Select a flow and test data
          </p>
        </div>

        <FlowConfigPanel
          flows={flows}
          leads={leads}
          sourceFilter={sourceFilter}
          selectedFlowId={selectedFlowId}
          selectedLeadId={selectedLeadId}
          credentials={credentials}
          isRunning={isRunning}
          onSourceFilterChange={setSourceFilter}
          onFlowSelect={setSelectedFlowId}
          onLeadSelect={setSelectedLeadId}
          onCredentialsChange={setCredentials}
        />

        <ExecutionControls
          isRunning={isRunning}
          canRun={!!canRun}
          onRun={handleRun}
          onStop={handleStop}
        />
      </aside>

      {/* Right Panel - Execution */}
      <FlowExecutionPanel
        logs={logs}
        isRunning={isRunning}
        error={runError}
        selectedFlow={selectedFlow}
        onClearLogs={clearLogs}
      />
    </div>
  );
}
