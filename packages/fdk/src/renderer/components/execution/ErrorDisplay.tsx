/**
 * Error Display Component
 * Shows execution errors with copy functionality
 */

interface ErrorDisplayProps {
  error: string;
  copied: boolean;
  onCopy: () => void;
}

export function ErrorDisplay({ error, copied, onCopy }: ErrorDisplayProps) {
  return (
    <div
      className="mx-6 mt-4 p-4 rounded-lg border"
      style={{
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderColor: 'var(--status-error)',
      }}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium" style={{ color: 'var(--status-error)' }}>
          Execution Error
        </p>
        <button
          onClick={onCopy}
          className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
          style={{
            backgroundColor: copied ? 'var(--accent-muted)' : 'transparent',
            color: copied ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        {error}
      </p>
    </div>
  );
}
