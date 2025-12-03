import { Clock } from "lucide-react";
import { Card } from "@/renderer/components/ui/Card";
import { formatEstimatedTime } from "../utils";

interface SummaryCardProps {
  selectedFlowsCount: number;
  selectedLeadsCount: number;
  totalTasks: number;
  estimatedDuration: number;
}

export function SummaryCard({
  selectedFlowsCount,
  selectedLeadsCount,
  totalTasks,
  estimatedDuration,
}: SummaryCardProps) {
  if (selectedFlowsCount === 0 && selectedLeadsCount === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-[var(--color-surface-alt)]">
      <div className="flex items-center justify-center gap-4">
        <span className="text-lg font-semibold text-[var(--color-text-primary)]">
          {selectedFlowsCount} produit{selectedFlowsCount > 1 ? "s" : ""} × {selectedLeadsCount}{" "}
          lead
          {selectedLeadsCount > 1 ? "s" : ""} ={" "}
          <span className="text-[var(--color-primary)]">
            {totalTasks} tâche{totalTasks > 1 ? "s" : ""}
          </span>
        </span>
        {/* Estimated duration */}
        {estimatedDuration > 0 && (
          <>
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{formatEstimatedTime(estimatedDuration)}</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
