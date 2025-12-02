import { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/renderer/components/ui/Table";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import { Card } from "@/renderer/components/ui/Card";
import { Clock, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { FlowTableRow } from "./FlowTableRow";
import type { LiveItemState } from "../../hooks/useFlowProgress";

type FlowsTableProps = {
  items: LiveItemState[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  loading: boolean;
};

type SortColumn = 'status' | 'flowKey' | 'progress' | 'duration';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

// Status priority: running > queued > completed > failed > cancelled
function getStatusPriority(status: LiveItemState["status"]): number {
  switch (status) {
    case "running": return 0;
    case "queued": return 1;
    case "completed": return 2;
    case "failed": return 3;
    case "cancelled": return 4;
    default: return 5;
  }
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
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <div className="flex items-center gap-2 ml-auto">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-1.5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function FlowsTable({
  items,
  selectedItemId,
  onSelectItem,
  loading,
}: FlowsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'status',
    direction: 'asc',
  });

  const handleSort = useCallback((column: SortColumn) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { column, direction: 'asc' }
    })
  }, []);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.column) {
        case 'status':
          comparison = getStatusPriority(a.status) - getStatusPriority(b.status);
          break;
        case 'flowKey':
          comparison = a.flowKey.localeCompare(b.flowKey);
          break;
        case 'progress': {
          const progressA = a.steps.length > 0
            ? a.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length / a.steps.length
            : 0;
          const progressB = b.steps.length > 0
            ? b.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length / b.steps.length
            : 0;
          comparison = progressA - progressB;
          break;
        }
        case 'duration': {
          const durationA = a.duration ?? (a.startedAt ? Date.now() - a.startedAt : 0);
          const durationB = b.duration ?? (b.startedAt ? Date.now() - b.startedAt : 0);
          comparison = durationA - durationB;
          break;
        }
      }

      // Secondary sort by startedAt for same status
      if (comparison === 0 && a.startedAt && b.startedAt) {
        comparison = b.startedAt - a.startedAt;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, sortConfig]);

  if (loading && items.length === 0) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-4 rounded-full bg-[var(--color-surface)] mb-4">
          <Clock className="h-8 w-8 text-[var(--color-text-muted)]" />
        </div>
        <p className="text-[var(--color-text-muted)]">
          En attente de démarrage...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-14 cursor-pointer group select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Statut
                  <SortIcon column="status" sortConfig={sortConfig} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer group select-none"
                onClick={() => handleSort('flowKey')}
              >
                <div className="flex items-center gap-1">
                  Flux
                  <SortIcon column="flowKey" sortConfig={sortConfig} />
                </div>
              </TableHead>
              <TableHead className="w-32">Lead</TableHead>
              <TableHead
                className="w-40 text-right cursor-pointer group select-none"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center justify-end gap-1">
                  Progression
                  <SortIcon column="progress" sortConfig={sortConfig} />
                </div>
              </TableHead>
              <TableHead
                className="w-24 text-right cursor-pointer group select-none"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center justify-end gap-1">
                  Durée
                  <SortIcon column="duration" sortConfig={sortConfig} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item, index) => (
              <FlowTableRow
                key={item.itemId}
                item={item}
                index={index}
                isSelected={item.itemId === selectedItemId}
                onClick={() => onSelectItem(item.itemId)}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
