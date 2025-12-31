/**
 * Flow Badges Components
 * Source and status badges for flow cards
 */

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'active':
      return { bg: 'rgba(61, 220, 132, 0.15)', text: 'var(--status-success)' };
    case 'draft':
      return { bg: 'rgba(255, 190, 11, 0.15)', text: 'var(--status-warning)' };
    case 'deprecated':
      return { bg: 'rgba(255, 107, 107, 0.15)', text: 'var(--status-error)' };
    default:
      return { bg: 'var(--bg-hover)', text: 'var(--text-muted)' };
  }
}

function getSourceBadgeStyle(source: 'file' | 'database') {
  if (source === 'file') {
    return { bg: 'rgba(0, 217, 255, 0.15)', text: 'var(--accent-primary)' };
  }
  return { bg: 'rgba(139, 149, 165, 0.15)', text: 'var(--text-secondary)' };
}

interface SourceBadgeProps {
  source: 'file' | 'database';
  filePath?: string;
}

export function SourceBadge({ source, filePath }: SourceBadgeProps) {
  const style = getSourceBadgeStyle(source);

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
      style={{ backgroundColor: style.bg, color: style.text }}
      title={source === 'file' ? filePath : 'Database'}
    >
      {source === 'file' ? (
        <>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          file
        </>
      ) : (
        <>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          db
        </>
      )}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = getStatusBadgeColor(status);

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {status}
    </span>
  );
}
