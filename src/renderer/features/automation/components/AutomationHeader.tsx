import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/renderer/components/ui/Button'
import { StatCard } from '@/renderer/components/ui/StatCard'
import type { AutomationStats } from '../types'

interface AutomationHeaderProps {
  stats: AutomationStats
  loading?: boolean
  onNewRun: () => void
  onRefresh: () => void
}

export function AutomationHeader({
  stats,
  loading,
  onNewRun,
  onRefresh,
}: AutomationHeaderProps) {

  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] font-display">
            Automation
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Manage your automated workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onNewRun}>
            <Plus className="h-4 w-4" />
            New Run
          </Button>
        </div>
      </div>

      {/* Stats bar - responsive grid with visual grouping */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Active stats group */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
          <StatCard
            label="Queued"
            value={stats.queued}
            variant="info"
            size="compact"
            pulse={stats.queued > 0}
            className="sm:w-28"
          />
          <StatCard
            label="Running"
            value={stats.running}
            variant="primary"
            size="compact"
            pulse={stats.running > 0}
            className="sm:w-28"
          />
        </div>

        {/* Separator - visible only on larger screens */}
        <div className="hidden sm:block w-px bg-[var(--color-border)] self-stretch my-1" />

        {/* Completed stats group */}
        <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-3 flex-1">
          <StatCard
            label="Done"
            value={stats.done}
            variant="success"
            size="compact"
            className="sm:w-28"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            variant="error"
            size="compact"
            className="sm:w-28"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            variant="default"
            size="compact"
            className="sm:w-28"
          />
        </div>
      </div>
    </div>
  )
}
