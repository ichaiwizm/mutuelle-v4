/**
 * Flow Execution Panel
 * Main panel showing execution status, logs, and errors
 */
import { useState, useCallback } from 'react';
import { LogViewer } from './LogViewer';
import { StatusHeader } from './execution/StatusHeader';
import { ErrorDisplay } from './execution/ErrorDisplay';
import { type LogEntry } from '../hooks/useFlowRunner';
import { type FlowInfo } from '../hooks/useFlows';

interface FlowExecutionPanelProps {
  logs: LogEntry[];
  isRunning: boolean;
  error: string | null;
  selectedFlow: FlowInfo | undefined;
  onClearLogs: () => void;
}

export function FlowExecutionPanel({
  logs,
  isRunning,
  error,
  selectedFlow,
  onClearLogs,
}: FlowExecutionPanelProps) {
  const [copied, setCopied] = useState(false);

  const mappedLogs = logs.map((l) => ({
    ...l,
    timestamp: l.timestamp instanceof Date ? l.timestamp : new Date(l.timestamp),
  }));

  const handleCopyLogs = useCallback(() => {
    const logText = logs
      .map((l) => {
        const ts = l.timestamp instanceof Date ? l.timestamp : new Date(l.timestamp);
        const time = ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `[${time}] [${l.level.toUpperCase()}] ${l.message}`;
      })
      .join('\n');

    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [logs]);

  const handleCopyError = useCallback(() => {
    if (error) {
      navigator.clipboard.writeText(error).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [error]);

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <StatusHeader
        isRunning={isRunning}
        error={error}
        logsCount={logs.length}
        selectedFlow={selectedFlow}
        copied={copied}
        onCopyLogs={handleCopyLogs}
        onClearLogs={onClearLogs}
      />

      {error && <ErrorDisplay error={error} copied={copied} onCopy={handleCopyError} />}

      <div className="flex-1 p-6 min-h-0">
        <LogViewer logs={mappedLogs} className="h-full" />
      </div>
    </main>
  );
}
