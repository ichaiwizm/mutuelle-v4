import { Link } from 'react-router-dom';

interface Flow {
  id: string;
  name: string;
  version: string;
}

interface FlowPreviewListProps {
  flows: Flow[];
  loading: boolean;
}

export function FlowPreviewList({ flows, loading }: FlowPreviewListProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Available Flows
        </h2>
        <Link to="/flows" className="text-sm hover:underline" style={{ color: 'var(--accent-primary)' }}>
          View all
        </Link>
      </div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading flows...</div>
        ) : flows.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No flows found in database</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {flows.slice(0, 5).map((flow, index) => (
              <Link
                key={flow.id}
                to={`/flows/${flow.id}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold"
                    style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
                  >
                    {flow.name.substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)' }}>{flow.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>v{flow.version}</p>
                  </div>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
