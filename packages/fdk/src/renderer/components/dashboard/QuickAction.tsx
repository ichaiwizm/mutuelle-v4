import { Link } from 'react-router-dom';

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

export function QuickAction({ to, icon, label, description }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="p-4 rounded-xl border transition-all duration-200 hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] group"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-4">
        <span
          className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors group-hover:bg-[var(--accent-muted)]"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >
          {icon}
        </span>
        <div>
          <h3 className="font-medium group-hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-primary)' }}>
            {label}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
    </Link>
  );
}
