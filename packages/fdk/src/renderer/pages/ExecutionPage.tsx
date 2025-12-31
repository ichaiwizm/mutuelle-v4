/**
 * Execution Page
 * Live view of a running or completed execution
 */
import { useParams, Link } from 'react-router-dom';

export function ExecutionPage() {
  const { executionId } = useParams<{ executionId: string }>();

  // TODO: Implement execution detail view with:
  // - Real-time step progress
  // - Screenshot gallery
  // - Error details
  // - Pause/Resume controls

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className="px-8 py-6 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 text-sm mb-2">
          <Link to="/history" style={{ color: 'var(--text-muted)' }} className="hover:underline">
            History
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Execution</span>
        </div>

        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Execution Details
        </h1>
        <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
          ID: {executionId}
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="text-center p-12 rounded-xl border max-w-md"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--text-muted)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Coming Soon
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Execution detail view with real-time progress, screenshots, and replay functionality will be available in a future update.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/history"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
              }}
            >
              Back to History
            </Link>
            <Link
              to="/run"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              Run New Flow
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
