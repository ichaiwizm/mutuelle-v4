import { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/renderer/components/ui/Table";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import { Card } from "@/renderer/components/ui/Card";
import { Clock } from "lucide-react";
import { FlowTableRow } from "./FlowTableRow";
import type { LiveItemState } from "../../hooks/useFlowProgress";

type FlowsTableProps = {
  items: LiveItemState[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  loading: boolean;
};

// Sort priority: running > queued > completed > failed
function getStatusPriority(status: LiveItemState["status"]): number {
  switch (status) {
    case "running":
      return 0;
    case "queued":
      return 1;
    case "completed":
      return 2;
    case "failed":
      return 3;
    default:
      return 4;
  }
}

export function FlowsTable({
  items,
  selectedItemId,
  onSelectItem,
  loading,
}: FlowsTableProps) {
  // Sort items by status priority
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      // Secondary sort by startedAt (most recent first for running)
      if (a.startedAt && b.startedAt) {
        return b.startedAt - a.startedAt;
      }
      return 0;
    });
  }, [items]);

  if (loading && items.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </Card>
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
              <TableHead className="w-14">Status</TableHead>
              <TableHead>Flux</TableHead>
              <TableHead className="w-32">Lead</TableHead>
              <TableHead className="w-40 text-right">Progression</TableHead>
              <TableHead className="w-24 text-right">Durée</TableHead>
              <TableHead className="w-20 text-center">Captures</TableHead>
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
