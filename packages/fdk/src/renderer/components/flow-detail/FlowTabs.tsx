type Tab = 'steps' | 'yaml';

interface FlowTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function FlowTabs({ activeTab, onTabChange }: FlowTabsProps) {
  const tabs: Tab[] = ['steps', 'yaml'];

  return (
    <div className="px-8 border-b flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
            style={{
              borderColor: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            {tab === 'steps' ? 'Steps' : 'YAML'}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Tab };
