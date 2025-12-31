/**
 * Source Toggle Bar Component
 * Horizontal toggle for source selection
 */
import { type FlowSource } from '../../hooks/useFlows';

interface SourceToggleBarProps {
  value: FlowSource;
  onChange: (source: FlowSource) => void;
}

export function SourceToggleBar({ value, onChange }: SourceToggleBarProps) {
  const buttons: Array<{ key: FlowSource; label: string }> = [
    { key: 'all', label: 'Tous' },
    { key: 'file', label: 'Fichiers' },
    { key: 'database', label: 'Database' },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm mr-2" style={{ color: 'var(--text-muted)' }}>Source:</span>
      <div className="inline-flex rounded-lg p-1" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        {buttons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => onChange(btn.key)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: value === btn.key ? 'var(--accent-muted)' : 'transparent',
              color: value === btn.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: value === btn.key ? '0 0 8px rgba(0, 217, 255, 0.3)' : 'none',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
