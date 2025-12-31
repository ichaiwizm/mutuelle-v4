interface Step {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface StepsViewProps {
  steps: Step[];
  loading: boolean;
}

const stepTypeColors: Record<string, { bg: string; text: string }> = {
  auth: { bg: 'rgba(0, 217, 255, 0.15)', text: 'var(--accent-primary)' },
  navigation: { bg: 'rgba(61, 220, 132, 0.15)', text: 'var(--status-success)' },
  'form-fill': { bg: 'rgba(255, 190, 11, 0.15)', text: 'var(--status-warning)' },
  custom: { bg: 'rgba(139, 149, 165, 0.15)', text: 'var(--text-secondary)' },
};

export function StepsView({ steps, loading }: StepsViewProps) {
  if (loading) {
    return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading steps...</div>;
  }

  if (steps.length === 0) {
    return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No steps found</div>;
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const colors = stepTypeColors[step.type] || stepTypeColors.custom;
        return (
          <div
            key={step.id}
            className="flex items-center gap-4 p-4 rounded-xl border animate-fade-in"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', animationDelay: `${index * 50}ms` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 style={{ color: 'var(--text-primary)' }}>{step.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: colors.bg, color: colors.text }}>
                  {step.type}
                </span>
              </div>
              {step.description && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{step.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
