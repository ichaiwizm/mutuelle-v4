import { useMemo, useState, useCallback } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/renderer/components/ui/Table'
import { Card } from '@/renderer/components/ui/Card'
import { EmptyState } from '@/renderer/components/ui/EmptyState'
import { Skeleton } from '@/renderer/components/ui/Skeleton'
import { Zap, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RunRow } from './RunRow'
import type { Run } from '@/shared/types/run'

type SortColumn = 'status' | 'createdAt'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  column: SortColumn | null
  direction: SortDirection
}

interface RunsTableProps {
  runs: Run[]
  loading?: boolean
  cancelling?: string | null
  deleting?: string | null
  retrying?: string | null
  onCancel: (runId: string) => void
  onDelete: (runId: string) => void
  onRetry: (runId: string) => void
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
    return <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
  }
  return sortConfig.direction === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
  )
}

// Skeleton that mimics the actual table structure
function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function RunsTable({
  runs,
  loading,
  cancelling,
  deleting,
  retrying,
  onCancel,
  onDelete,
  onRetry,
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
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
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
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [runs, sortConfig])

  if (loading) {
    return <TableSkeleton />
  }

  if (runs.length === 0) {
    return (
      <EmptyState
        icon={<Zap className="h-8 w-8" />}
        title="Aucune exécution"
        description="Les exécutions remplissent automatiquement les formulaires d'adhésion. Sélectionnez un ou plusieurs leads et un produit pour lancer votre première automatisation."
        action={{
          label: 'Nouvelle exécution',
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
            <TableHead className="w-40">Exécution</TableHead>
            <TableHead className="w-24">Items</TableHead>
            <TableHead
              className="cursor-pointer group select-none w-32"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1.5">
                Statut
                <SortIcon column="status" sortConfig={sortConfig} />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer group select-none w-28"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center gap-1.5">
                Créé
                <SortIcon column="createdAt" sortConfig={sortConfig} />
              </div>
            </TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRuns.map((run, index) => (
            <RunRow
              key={run.id}
              run={run}
              index={index}
              isCancelling={cancelling === run.id}
              isDeleting={deleting === run.id}
              isRetrying={retrying === run.id}
              onCancel={() => onCancel(run.id)}
              onDelete={() => onDelete(run.id)}
              onRetry={() => onRetry(run.id)}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
