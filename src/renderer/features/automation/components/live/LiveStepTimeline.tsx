import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  SkipForward,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import type { StepProgress } from "@/shared/types/step-progress";

type LiveStepTimelineProps = {
  steps: StepProgress[];
  currentStepIndex: number;
  onScreenshotClick?: (screenshotPath: string) => void;
  className?: string;
};

function formatDuration(ms?: number): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getStatusIcon(status: StepProgress["status"], isActive: boolean) {
  const baseClass = "h-4 w-4";

  switch (status) {
    case "completed":
      return <CheckCircle2 className={cn(baseClass, "text-emerald-400")} />;
    case "failed":
      return <XCircle className={cn(baseClass, "text-red-400")} />;
    case "running":
      return <Loader2 className={cn(baseClass, "text-cyan-400 animate-spin")} />;
    case "skipped":
      return <SkipForward className={cn(baseClass, "text-zinc-500")} />;
    default:
      return (
        <Clock
          className={cn(baseClass, isActive ? "text-zinc-400" : "text-zinc-600")}
        />
      );
  }
}

function getStatusStyles(status: StepProgress["status"], isActive: boolean) {
  switch (status) {
    case "completed":
      return {
        dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
        line: "bg-emerald-500/30",
        text: "text-[var(--color-text-primary)]",
        bg: "",
      };
    case "failed":
      return {
        dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
        line: "bg-red-500/30",
        text: "text-[var(--color-text-primary)]",
        bg: "bg-red-500/5",
      };
    case "running":
      return {
        dot: "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse",
        line: "bg-cyan-500/30",
        text: "text-[var(--color-text-primary)] font-medium",
        bg: "bg-cyan-500/5",
      };
    case "skipped":
      return {
        dot: "bg-zinc-600",
        line: "bg-zinc-700",
        text: "text-zinc-500 line-through",
        bg: "",
      };
    default:
      return {
        dot: isActive ? "bg-zinc-500" : "bg-zinc-700",
        line: "bg-zinc-800",
        text: isActive ? "text-zinc-400" : "text-zinc-600",
        bg: "",
      };
  }
}

export function LiveStepTimeline({
  steps,
  currentStepIndex,
  onScreenshotClick,
  className,
}: LiveStepTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex && step.status === "running";
        const styles = getStatusStyles(step.status, isActive);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={cn(
              "relative flex gap-3 transition-all duration-300",
              styles.bg,
              isActive && "py-1"
            )}
          >
            {/* Timeline line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[9px] top-6 w-0.5 h-[calc(100%-8px)] transition-colors duration-500",
                  styles.line
                )}
              />
            )}

            {/* Status dot */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 border-[var(--color-surface)]",
                  styles.dot
                )}
              >
                {step.status === "running" && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getStatusIcon(step.status, isActive)}
                  <span
                    className={cn(
                      "text-sm truncate transition-colors duration-300",
                      styles.text
                    )}
                  >
                    {step.name}
                  </span>
                  {isActive && (
                    <ChevronRight className="h-3 w-3 text-cyan-400 animate-pulse" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Duration */}
                  {step.duration !== undefined && (
                    <span className="text-xs text-zinc-500 tabular-nums font-mono">
                      {formatDuration(step.duration)}
                    </span>
                  )}

                  {/* Screenshot indicator */}
                  {step.screenshot && onScreenshotClick && (
                    <button
                      onClick={() => onScreenshotClick(step.screenshot!)}
                      className="p-1 rounded hover:bg-zinc-800 transition-colors"
                      title="View screenshot"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
                    </button>
                  )}
                </div>
              </div>

              {/* Error message */}
              {step.error && (
                <p className="mt-1 text-xs text-red-400 truncate" title={step.error}>
                  {step.error}
                </p>
              )}

              {/* Retry indicator */}
              {step.retries !== undefined && step.retries > 0 && (
                <p className="mt-1 text-xs text-amber-500">
                  Retried {step.retries} time{step.retries > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
