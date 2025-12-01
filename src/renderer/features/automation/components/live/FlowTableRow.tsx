import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TableRow, TableCell } from "@/renderer/components/ui/Table";
import { StatusIndicator } from "../shared/StatusIndicator";
import { Camera, Activity, Hash } from "lucide-react";
import type { LiveItemState } from "../../hooks/useFlowProgress";

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
  // Calculate progress
  const completedSteps = item.steps.filter(
    (s) => s.status === "completed" || s.status === "skipped"
  ).length;
  const failedSteps = item.steps.filter((s) => s.status === "failed").length;
  const totalSteps = item.steps.length;
  const progress = totalSteps > 0 ? Math.round(((completedSteps + failedSteps) / totalSteps) * 100) : 0;

  // Count screenshots
  const screenshotCount = item.steps.filter((s) => s.screenshot).length;

  // Get elapsed time
  const elapsedTime = useMemo(() => {
    if (item.duration) return item.duration;
    if (item.startedAt) return Date.now() - item.startedAt;
    return 0;
  }, [item.duration, item.startedAt]);

  // Flow name formatted
  const flowName = item.flowKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Map status for StatusIndicator
  const statusForIndicator = item.status === "completed" ? "done" : item.status;

  const isRunning = item.status === "running";

  return (
    <TableRow
      index={index}
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected && "bg-[var(--color-primary)]/5 ring-1 ring-inset ring-[var(--color-primary)]/30",
        isRunning && !isSelected && "bg-cyan-500/5"
      )}
    >
      {/* Status */}
      <TableCell>
        <StatusIndicator status={statusForIndicator as any} size="md" />
      </TableCell>

      {/* Flow name with Live badge */}
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-text-primary)]">
            {flowName}
          </span>
          {isRunning && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10">
              <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-medium">Live</span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Lead ID */}
      <TableCell>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] w-fit">
          <Hash className="h-3 w-3" />
          <span className="font-mono text-xs">{item.leadId.slice(0, 8)}</span>
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
                item.status === "queued" && "bg-blue-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </TableCell>

      {/* Duration */}
      <TableCell className="text-right font-mono text-sm text-[var(--color-text-muted)]">
        {formatDuration(elapsedTime)}
      </TableCell>

      {/* Screenshot count */}
      <TableCell className="text-center">
        {screenshotCount > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
            <Camera className="h-3.5 w-3.5" />
            <span className="text-xs tabular-nums font-medium">{screenshotCount}</span>
          </div>
        ) : (
          <span className="text-[var(--color-text-muted)]">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}
