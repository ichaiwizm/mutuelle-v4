/**
 * History Page
 * View past execution history
 */
import { Link } from 'react-router-dom';

// TODO: Implement with useHistory hook
// For now, show placeholder

export function HistoryPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className="px-8 py-6 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Execution History
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          View and replay past flow executions
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
            No Execution History
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Execution history will appear here after you run flows. History persistence will be implemented in a future update.
          </p>
          <div className="mt-6">
            <Link
              to="/run"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run Your First Flow
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
