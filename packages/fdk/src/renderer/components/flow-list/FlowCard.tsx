/**
 * Flow Card Component
 * Individual flow card with badges and metadata
 */
import { Link } from 'react-router-dom';
import { type FlowInfo } from '../../hooks/useFlows';
import { SourceBadge, StatusBadge } from './FlowBadges';

interface FlowCardProps {
  flow: FlowInfo;
  index: number;
}

export function FlowCard({ flow, index }: FlowCardProps) {
  return (
    <Link
      to={`/flows/${flow.id}`}
      className="p-5 rounded-xl border transition-all duration-200 hover:border-[var(--accent-primary)] hover:shadow-lg animate-fade-in group"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
        animationDelay: `${index * 30}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center font-mono text-sm font-bold transition-colors group-hover:bg-[var(--accent-muted)]"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-secondary)',
          }}
        >
          {flow.platform?.substring(0, 2).toUpperCase() || 'FL'}
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge source={flow.source} filePath={flow.filePath} />
          <StatusBadge status={flow.status} />
        </div>
      </div>

      <h3
        className="font-semibold mb-1 group-hover:text-[var(--accent-primary)] transition-colors"
        style={{ color: 'var(--text-primary)' }}
      >
        {flow.name}
      </h3>
      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
        {flow.description || 'No description'}
      </p>

      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="font-mono">v{flow.version}</span>
        <span>-</span>
        <span>{flow.platform}</span>
        <span>-</span>
        <span>{flow.product}</span>
      </div>
    </Link>
  );
}
