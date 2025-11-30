import { cn } from '@/lib/utils'
import { List, PauseCircle, Package } from 'lucide-react'
import type { TabType } from '../types'

interface Tab {
  id: TabType
  label: string
  icon: React.ReactNode
  count?: number
}

interface AutomationTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  pausedCount?: number
  productsCount?: number
}

export function AutomationTabs({
  activeTab,
  onTabChange,
  pausedCount = 0,
  productsCount = 0,
}: AutomationTabsProps) {
  const tabs: Tab[] = [
    { id: 'runs', label: 'Runs', icon: <List className="h-4 w-4" /> },
    {
      id: 'paused',
      label: 'Paused Flows',
      icon: <PauseCircle className="h-4 w-4" />,
      count: pausedCount,
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="h-4 w-4" />,
      count: productsCount,
    },
  ]

  return (
    <div className="border-b border-[var(--color-border)]">
      <nav className="flex gap-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              'hover:text-[var(--color-text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-inset',
              activeTab === tab.id
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)]'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                )}
              >
                {tab.count}
              </span>
            )}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                style={{
                  animation: 'slideIn 200ms ease-out',
                }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
