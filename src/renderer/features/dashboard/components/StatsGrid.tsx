import { Users, Zap } from 'lucide-react'
import { StatCard } from '@/renderer/components/ui'
import type { Run } from '@/shared/types/run'

interface StatsGridProps {
  totalLeads: number
  totalRuns: number
  recentRuns: Run[]
}

export function StatsGrid({ totalLeads, totalRuns, recentRuns }: StatsGridProps) {
  const runningCount = recentRuns.filter((r) => r.status === 'running').length
  const doneCount = recentRuns.filter((r) => r.status === 'done').length

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard title="Total Leads" value={totalLeads} icon={Users} />
      <StatCard
        title="Total Runs"
        value={totalRuns}
        icon={Zap}
        subtitle={`${runningCount} running, ${doneCount} done`}
      />
    </div>
  )
}
