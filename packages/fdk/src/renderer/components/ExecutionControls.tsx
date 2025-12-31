/**
 * Execution Controls
 * Run/Stop buttons for flow execution
 */

interface ExecutionControlsProps {
  isRunning: boolean;
  canRun: boolean;
  onRun: () => void;
  onStop: () => void;
}

export function ExecutionControls({
  isRunning,
  canRun,
  onRun,
  onStop,
}: ExecutionControlsProps) {
  return (
    <div
      className="p-6 border-t space-y-3"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {isRunning ? (
        <button
          onClick={onStop}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--status-error)',
            color: 'white',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop Execution
          </span>
        </button>
      ) : (
        <button
          onClick={onRun}
          disabled={!canRun}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: canRun ? 'var(--accent-primary)' : 'var(--bg-hover)',
            color: canRun ? 'var(--bg-primary)' : 'var(--text-muted)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Run Flow
          </span>
        </button>
      )}
    </div>
  );
}
