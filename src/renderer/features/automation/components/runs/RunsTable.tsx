import { useMemo, useState, useCallback } from 'react'
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
import { Zap, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RunRow } from './RunRow'
import type { Run } from '@/shared/types/run'

type SortColumn = 'status' | 'itemsCount' | 'createdAt'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  column: SortColumn | null
  direction: SortDirection
}

interface RunsTableProps {
  runs: Run[]
  loading?: boolean
  cancelling?: string | null
  onCancel: (runId: string) => void
  onNewRun: () => void
}

// Status priority for sorting
const STATUS_PRIORITY: Record<string, number> = {
  running: 0,
  queued: 1,
  done: 2,
  failed: 3,
  cancelled: 4,
}

function SortIcon({ column, sortConfig }: { column: SortColumn; sortConfig: SortConfig }) {
  if (sortConfig.column !== column) {
    return <ChevronsUpDown className="h-4 w-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
  }
  return sortConfig.direction === 'asc' ? (
    <ChevronUp className="h-4 w-4 text-[var(--color-primary)]" />
  ) : (
    <ChevronDown className="h-4 w-4 text-[var(--color-primary)]" />
  )
}

export function RunsTable({
  runs,
  loading,
  cancelling,
  onCancel,
  onNewRun,
}: RunsTableProps) {
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'createdAt',
    direction: 'desc',
  })

  // Handle sort click
  const handleSort = useCallback((column: SortColumn) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        // Toggle direction if same column
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      // Default to desc for new column
      return { column, direction: 'desc' }
    })
  }, [])

  // Sort runs
  const sortedRuns = useMemo(() => {
    if (!sortConfig.column) return runs

    return [...runs].sort((a, b) => {
      let comparison = 0

      switch (sortConfig.column) {
        case 'status':
          comparison = (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
          break
        case 'itemsCount':
          comparison = (a.itemsCount ?? 0) - (b.itemsCount ?? 0)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [runs, sortConfig])

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
            <TableHead className="w-48">Run</TableHead>
            <TableHead
              className="cursor-pointer group select-none"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                <SortIcon column="status" sortConfig={sortConfig} />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer group select-none"
              onClick={() => handleSort('itemsCount')}
            >
              <div className="flex items-center gap-1">
                Items
                <SortIcon column="itemsCount" sortConfig={sortConfig} />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer group select-none"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center gap-1">
                Created
                <SortIcon column="createdAt" sortConfig={sortConfig} />
              </div>
            </TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRuns.map((run, index) => (
            <RunRow
              key={run.id}
              run={run}
              index={index}
              isCancelling={cancelling === run.id}
              onCancel={() => onCancel(run.id)}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
