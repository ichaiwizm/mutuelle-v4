import { Users, Zap, PauseCircle, Play, Loader2 } from 'lucide-react'
import { Button, StatCard } from '@/renderer/components/ui'
import type { Run } from '@/shared/types/run'

interface StatsGridProps {
  totalLeads: number
  totalRuns: number
  recentRuns: Run[]
  pausedCount: number
  isResuming: boolean
  onResumeAll: () => void
}

export function StatsGrid({
  totalLeads, totalRuns, recentRuns, pausedCount, isResuming, onResumeAll
}: StatsGridProps) {
  const runningCount = recentRuns.filter(r => r.status === 'running').length
  const doneCount = recentRuns.filter(r => r.status === 'done').length

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Total Leads" value={totalLeads} icon={Users} />
      <StatCard
        title="Total Runs"
        value={totalRuns}
        icon={Zap}
        subtitle={`${runningCount} running, ${doneCount} done`}
      />
      <StatCard
        title="Paused Flows"
        value={pausedCount}
        icon={PauseCircle}
        action={
          pausedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onResumeAll} disabled={isResuming}>
              {isResuming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isResuming ? 'Resuming...' : 'Resume All'}
            </Button>
          )
        }
      />
    </div>
  )
}
