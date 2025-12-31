/**
 * Status Header Component
 * Displays execution status indicator and action buttons
 */
import { type FlowInfo } from '../../hooks/useFlows';

interface StatusHeaderProps {
  isRunning: boolean;
  error: string | null;
  logsCount: number;
  selectedFlow: FlowInfo | undefined;
  copied: boolean;
  onCopyLogs: () => void;
  onClearLogs: () => void;
}

export function StatusHeader({
  isRunning,
  error,
  logsCount,
  selectedFlow,
  copied,
  onCopyLogs,
  onClearLogs,
}: StatusHeaderProps) {
  const getStatusColor = () => {
    if (isRunning) return 'var(--status-running)';
    if (error) return 'var(--status-error)';
    if (logsCount > 0) return 'var(--status-success)';
    return 'var(--text-muted)';
  };

  const getStatusText = () => {
    if (isRunning) return 'Running...';
    if (error) return 'Error';
    if (logsCount > 0) return 'Completed';
    return 'Ready';
  };

  return (
    <div
      className="px-6 py-4 border-b flex items-center justify-between"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${isRunning ? 'animate-pulse-cyan' : ''}`}
          style={{ backgroundColor: getStatusColor() }}
        />
        <span style={{ color: 'var(--text-primary)' }}>{getStatusText()}</span>
        {selectedFlow && (
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            · {selectedFlow.name}
          </span>
        )}
      </div>

      {logsCount > 0 && (
        <div className="flex items-center gap-3">
          <CopyButton copied={copied} onClick={onCopyLogs} label="Copy logs" />
          {!isRunning && (
            <button
              onClick={onClearLogs}
              className="text-sm hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
  label: string;
}

function CopyButton({ copied, onClick, label }: CopyButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-sm flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors"
      style={{
        backgroundColor: copied ? 'var(--accent-muted)' : 'transparent',
        color: copied ? 'var(--accent-primary)' : 'var(--text-muted)',
      }}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
