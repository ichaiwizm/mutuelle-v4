import { useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/renderer/components/ui/Table'
import { Card } from '@/renderer/components/ui/Card'
import { EmptyState } from '@/renderer/components/ui/EmptyState'
import { Skeleton } from '@/renderer/components/ui/Skeleton'
import { Zap } from 'lucide-react'
import { RunRow } from './RunRow'
import type { Run } from '@/shared/types/run'

interface RunsTableProps {
  runs: Run[]
  loading?: boolean
  cancelling?: string | null
  onCancel: (runId: string) => void
  onView: (runId: string) => void
  onNewRun: () => void
}

export function RunsTable({
  runs,
  loading,
  cancelling,
  onCancel,
  onView,
  onNewRun,
}: RunsTableProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (runs.length === 0) {
    return (
      <EmptyState
        icon={<Zap className="h-8 w-8" />}
        title="No automation runs"
        description="Start your first automation to see runs appear here."
        action={{
          label: 'New Run',
          onClick: onNewRun,
        }}
      />
    )
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run, index) => (
            <RunRow
              key={run.id}
              run={run}
              index={index}
              isCancelling={cancelling === run.id}
              onCancel={() => onCancel(run.id)}
              onView={() => onView(run.id)}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
