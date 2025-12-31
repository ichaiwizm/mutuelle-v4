interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  cyan: 'var(--accent-primary)',
  green: 'var(--status-success)',
  yellow: 'var(--status-warning)',
  red: 'var(--status-error)',
};

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div
      className="p-5 rounded-xl border animate-fade-in"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${colorMap[color]}20`, color: colorMap[color] }}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color: colorMap[color] }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}
