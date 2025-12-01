import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/renderer/components/ui/Card";
import { Button } from "@/renderer/components/ui/Button";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Package,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { LiveStepTimeline } from "./LiveStepTimeline";
import type { LiveItemState } from "../../hooks/useFlowProgress";

type FlowProgressCardProps = {
  item: LiveItemState;
  leadName?: string;
  productName?: string;
  onScreenshotClick?: (screenshotPath: string) => void;
  className?: string;
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

function getStatusConfig(status: LiveItemState["status"]) {
  switch (status) {
    case "running":
      return {
        icon: Loader2,
        iconClass: "text-cyan-400 animate-spin",
        borderClass: "border-l-cyan-500",
        bgClass: "bg-gradient-to-r from-cyan-500/5 to-transparent",
        label: "En cours",
        labelClass: "text-cyan-400",
      };
    case "completed":
      return {
        icon: CheckCircle2,
        iconClass: "text-emerald-400",
        borderClass: "border-l-emerald-500",
        bgClass: "",
        label: "Terminé",
        labelClass: "text-emerald-400",
      };
    case "failed":
      return {
        icon: XCircle,
        iconClass: "text-red-400",
        borderClass: "border-l-red-500",
        bgClass: "bg-gradient-to-r from-red-500/5 to-transparent",
        label: "Échoué",
        labelClass: "text-red-400",
      };
    default:
      return {
        icon: Clock,
        iconClass: "text-zinc-500",
        borderClass: "border-l-zinc-600",
        bgClass: "",
        label: "En attente",
        labelClass: "text-zinc-500",
      };
  }
}

export function FlowProgressCard({
  item,
  leadName,
  productName,
  onScreenshotClick,
  className,
}: FlowProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(item.status === "running");

  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;

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

  // Get current step name
  const currentStep = item.steps[item.currentStepIndex];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "border-l-4",
        statusConfig.borderClass,
        statusConfig.bgClass,
        className
      )}
    >
      {/* Progress bar background */}
      {item.status === "running" && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "flex-shrink-0 p-2 rounded-lg",
                "bg-[var(--color-surface-alt)]"
              )}
            >
              <StatusIcon className={cn("h-5 w-5", statusConfig.iconClass)} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                  {productName || item.flowKey.replace(/_/g, " ")}
                </h3>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    "bg-[var(--color-surface-alt)]",
                    statusConfig.labelClass
                  )}
                >
                  {statusConfig.label}
                </span>
              </div>

              {/* Lead info */}
              <div className="flex items-center gap-4 mt-1 text-sm text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {leadName || `Lead ${item.leadId.slice(0, 8)}...`}
                  </span>
                </div>
                {elapsedTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs">
                      {formatDuration(elapsedTime)}
                    </span>
                  </div>
                )}
                {screenshotCount > 0 && (
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>{screenshotCount}</span>
                  </div>
                )}
              </div>

              {/* Current step indicator */}
              {item.status === "running" && currentStep && (
                <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{currentStep.name}</span>
                </div>
              )}

              {/* Error message */}
              {item.error && (
                <p className="mt-2 text-xs text-red-400 line-clamp-2">{item.error}</p>
              )}
            </div>
          </div>

          {/* Progress and expand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Progress indicator */}
            <div className="text-right">
              <div className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">
                {completedSteps}/{totalSteps}
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">étapes</div>
            </div>

            {/* Expand button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              item.status === "running" && "bg-gradient-to-r from-cyan-500 to-cyan-400",
              item.status === "completed" && "bg-emerald-500",
              item.status === "failed" && "bg-red-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Expanded timeline */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <LiveStepTimeline
              steps={item.steps}
              currentStepIndex={item.currentStepIndex}
              onScreenshotClick={onScreenshotClick}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
