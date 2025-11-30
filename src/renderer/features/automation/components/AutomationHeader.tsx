import { Plus, RefreshCw, Settings } from 'lucide-react'
import { Button } from '@/renderer/components/ui/Button'
import { StatCard } from '@/renderer/components/ui/StatCard'
import type { AutomationStats } from '../types'

interface AutomationHeaderProps {
  stats: AutomationStats
  loading?: boolean
  onNewRun: () => void
  onRefresh: () => void
  onResumeAll?: () => void
  isResuming?: boolean
}

export function AutomationHeader({
  stats,
  loading,
  onNewRun,
  onRefresh,
  onResumeAll,
  isResuming,
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

      {/* Stats bar */}
      <div className="grid grid-cols-6 gap-3">
        <StatCard
          label="Queued"
          value={stats.queued}
          variant="info"
          size="compact"
        />
        <StatCard
          label="Running"
          value={stats.running}
          variant="primary"
          size="compact"
          pulse={stats.running > 0}
        />
        <StatCard
          label="Done"
          value={stats.done}
          variant="success"
          size="compact"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          variant="error"
          size="compact"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          variant="default"
          size="compact"
        />
        <div className="flex items-center gap-2">
          <StatCard
            label="Paused"
            value={stats.paused}
            variant="warning"
            size="compact"
            className="flex-1"
          />
          {stats.paused > 0 && onResumeAll && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResumeAll}
              disabled={isResuming}
              className="h-full"
            >
              {isResuming ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Resume All'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
