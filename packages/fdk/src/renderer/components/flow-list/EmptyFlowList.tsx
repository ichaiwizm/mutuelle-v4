/**
 * Empty Flow List Component
 * Displayed when no flows are found
 */

interface EmptyFlowListProps {
  search: string;
}

export function EmptyFlowList({ search }: EmptyFlowListProps) {
  return (
    <div
      className="p-12 rounded-xl border text-center"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <svg
        className="w-12 h-12 mx-auto mb-4"
        style={{ color: 'var(--text-muted)' }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
      </svg>
      <p style={{ color: 'var(--text-secondary)' }}>No flows found</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        {search ? 'Try a different search term' : 'Add flows to the database to get started'}
      </p>
    </div>
  );
}
