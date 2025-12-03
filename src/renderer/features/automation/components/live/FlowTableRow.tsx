import { cn } from "@/lib/utils";
import { TableRow, TableCell } from "@/renderer/components/ui/Table";
import { StatusIndicator } from "../shared/StatusIndicator";
import { User, ExternalLink } from "lucide-react";
import type { LiveItemState } from "../../hooks/useFlowProgress";
import { useElapsedTime } from "../../hooks/useElapsedTime";
import { useState } from "react";

type FlowTableRowProps = {
  item: LiveItemState;
  index: number;
  isSelected: boolean;
  onClick: () => void;
};

function formatDuration(ms?: number): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function FlowTableRow({ item, index, isSelected, onClick }: FlowTableRowProps) {
  const [isBringingToFront, setIsBringingToFront] = useState(false);

  // Status flags - defined first for use in hooks
  const isRunning = item.status === "running";
  const isCancelled = item.status === "cancelled";
  const isWaitingUser = item.status === "waiting_user";

  // Handler for bring to front
  const handleBringToFront = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    setIsBringingToFront(true);
    try {
      await window.api.automation.bringToFront(item.itemId);
    } catch (err) {
      console.error("Failed to bring window to front:", err);
    } finally {
      setIsBringingToFront(false);
    }
  };

  // Calculate progress
  const completedSteps = item.steps.filter(
    (s) => s.status === "completed" || s.status === "skipped"
  ).length;
  const failedSteps = item.steps.filter((s) => s.status === "failed").length;
  const totalSteps = item.steps.length;
  const progress = totalSteps > 0 ? Math.round(((completedSteps + failedSteps) / totalSteps) * 100) : 0;

  // Get elapsed time - updates every second when running
  const elapsedTime = useElapsedTime(
    item.startedAt,
    item.completedAt,
    item.duration,
    isRunning
  );

  // Flow name formatted
  const flowName = item.flowKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Map status for StatusIndicator
  const statusForIndicator = item.status === "completed" ? "done" : item.status;

  return (
    <TableRow
      index={index}
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected && "bg-[var(--color-primary)]/5 ring-1 ring-inset ring-[var(--color-primary)]/30",
        isRunning && !isSelected && "bg-cyan-500/5",
        isCancelled && !isSelected && "bg-amber-500/5 opacity-70",
        isWaitingUser && !isSelected && "bg-orange-500/5"
      )}
    >
      {/* Status */}
      <TableCell>
        <StatusIndicator status={statusForIndicator as any} size="md" />
      </TableCell>

      {/* Flow name - no redundant Live badge */}
      <TableCell>
        <span className="font-medium text-[var(--color-text-primary)]">
          {flowName}
        </span>
      </TableCell>

      {/* Lead name */}
      <TableCell>
        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
          <User className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <span className="text-sm truncate max-w-[180px]">
            {item.leadName || "Lead inconnu"}
          </span>
        </div>
      </TableCell>

      {/* Progress */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm tabular-nums text-[var(--color-text-secondary)]">
            {completedSteps}/{totalSteps}
          </span>
          <div className="w-20 h-1.5 bg-[var(--color-surface-alt)] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                item.status === "running" && "bg-cyan-500",
                item.status === "completed" && "bg-emerald-500",
                item.status === "failed" && "bg-red-500",
                item.status === "queued" && "bg-blue-500",
                item.status === "cancelled" && "bg-amber-500",
                item.status === "waiting_user" && "bg-orange-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </TableCell>

      {/* Duration / Action */}
      <TableCell className="text-right">
        {isWaitingUser ? (
          <button
            onClick={handleBringToFront}
            disabled={isBringingToFront}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
              "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
              "focus:outline-none focus:ring-2 focus:ring-orange-500/50",
              isBringingToFront && "opacity-50 cursor-not-allowed"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Reprendre
          </button>
        ) : (
          <div className={cn(
            "inline-flex items-center gap-1.5 font-mono text-sm",
            isRunning ? "text-cyan-400 font-medium" : "text-[var(--color-text-muted)]"
          )}>
            {isRunning && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
            )}
            <span className="tabular-nums">{formatDuration(elapsedTime)}</span>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
