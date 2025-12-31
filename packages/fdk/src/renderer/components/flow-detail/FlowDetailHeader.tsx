import { Link } from 'react-router-dom';

interface FlowInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: string;
  product: string;
}

interface FlowDetailHeaderProps {
  flow: FlowInfo;
}

export function FlowDetailHeader({ flow }: FlowDetailHeaderProps) {
  return (
    <header className="px-8 py-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-2 text-sm mb-2">
        <Link to="/flows" style={{ color: 'var(--text-muted)' }} className="hover:underline">Flows</Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>{flow.name}</span>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{flow.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{flow.description || 'No description'}</p>
          <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-mono">v{flow.version}</span>
            <span>-</span>
            <span className="capitalize">{flow.platform}</span>
            <span>-</span>
            <span className="capitalize">{flow.product}</span>
          </div>
        </div>
        <Link
          to={`/run?flow=${flow.id}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Run Flow
        </Link>
      </div>
    </header>
  );
}
