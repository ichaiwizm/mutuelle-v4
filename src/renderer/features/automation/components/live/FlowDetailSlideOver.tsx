import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { SlideOver } from "@/renderer/components/ui/SlideOver";
import { SlideOverSection } from "@/renderer/components/ui/SlideOver/SlideOverSection";
import { Card } from "@/renderer/components/ui/Card";
import { StatusIndicator } from "../shared/StatusIndicator";
import { ProgressRing } from "../shared/ProgressRing";
import { LiveStepTimeline } from "./LiveStepTimeline";
import { FlowScreenshotGallery } from "./FlowScreenshotGallery";
import {
  Clock,
  Calendar,
  AlertCircle,
  Hash,
  Activity,
} from "lucide-react";
import type { LiveItemState } from "../../hooks/useFlowProgress";

type Screenshot = {
  path: string;
  stepName: string;
  stepId: string;
};

type FlowDetailSlideOverProps = {
  item: LiveItemState | null;
  open: boolean;
  onClose: () => void;
  onScreenshotClick: (screenshot: Screenshot) => void;
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

function formatTime(timestamp?: number): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)] last:border-b-0">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

export function FlowDetailSlideOver({
  item,
  open,
  onClose,
  onScreenshotClick,
}: FlowDetailSlideOverProps) {
  // Calculate progress
  const { progress, completedSteps, totalSteps } = useMemo(() => {
    if (!item) return { progress: 0, completedSteps: 0, totalSteps: 0 };
    const completed = item.steps.filter(
      (s) => s.status === "completed" || s.status === "skipped"
    ).length;
    const failed = item.steps.filter((s) => s.status === "failed").length;
    const total = item.steps.length;
    return {
      progress: total > 0 ? Math.round(((completed + failed) / total) * 100) : 0,
      completedSteps: completed,
      totalSteps: total,
    };
  }, [item]);

  // Collect screenshots for this flow
  const flowScreenshots = useMemo(() => {
    if (!item) return [];
    return item.steps
      .filter((s) => s.screenshot)
      .map((s) => ({
        path: s.screenshot!,
        stepName: s.name,
        stepId: s.id,
      }));
  }, [item]);

  // Get elapsed time
  const elapsedTime = useMemo(() => {
    if (!item) return 0;
    if (item.duration) return item.duration;
    if (item.startedAt) return Date.now() - item.startedAt;
    return 0;
  }, [item]);

  // Flow name formatted
  const flowName = item?.flowKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  // Progress color
  const progressColor = useMemo(() => {
    if (!item) return "var(--color-info)";
    if (item.status === "running") return "var(--color-info)";
    if (item.status === "failed") return "var(--color-error)";
    return "var(--color-success)";
  }, [item]);

  // Map status for StatusIndicator
  const statusForIndicator = item?.status === "completed" ? "done" : item?.status;

  const handleScreenshotClick = (screenshot: Screenshot) => {
    onScreenshotClick(screenshot);
  };

  const isRunning = item?.status === "running";

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={flowName}
      description={item ? `Lead: ${item.leadId.slice(0, 12)}...` : ""}
      width="lg"
    >
      {item && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <ProgressRing
                progress={progress}
                size="lg"
                color={progressColor}
                showPercentage
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusIndicator status={statusForIndicator as any} showLabel size="md" />
                  {isRunning && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10">
                      <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
                      <span className="text-xs text-cyan-400 font-medium">Live</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">
                    {completedSteps}
                  </span>
                  {" / "}
                  {totalSteps} étapes terminées
                </p>
                {isRunning && item.steps[item.currentStepIndex] && (
                  <p className="mt-1.5 text-xs text-cyan-400 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {item.steps[item.currentStepIndex].name}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Info Section */}
          <SlideOverSection title="Informations">
            <Card className="p-0 overflow-hidden">
              <div className="px-4">
                <InfoRow
                  icon={Hash}
                  label="Lead ID"
                  value={item.leadId.slice(0, 16) + "..."}
                />
                <InfoRow
                  icon={Clock}
                  label="Durée"
                  value={formatDuration(elapsedTime)}
                />
                <InfoRow
                  icon={Calendar}
                  label="Démarrage"
                  value={formatTime(item.startedAt)}
                />
              </div>
            </Card>

            {item.error && (
              <Card className="mt-3 p-3 bg-red-500/5 border-red-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{item.error}</p>
                </div>
              </Card>
            )}
          </SlideOverSection>

          {/* Steps Timeline */}
          <SlideOverSection title="Étapes">
            <Card className="p-4">
              <LiveStepTimeline
                steps={item.steps}
                currentStepIndex={item.currentStepIndex}
                onScreenshotClick={(path) => {
                  const screenshot = flowScreenshots.find((s) => s.path === path);
                  if (screenshot) {
                    handleScreenshotClick(screenshot);
                  }
                }}
              />
            </Card>
          </SlideOverSection>

          {/* Screenshots (per-flow) */}
          {flowScreenshots.length > 0 && (
            <SlideOverSection title={`Captures (${flowScreenshots.length})`}>
              <FlowScreenshotGallery
                screenshots={flowScreenshots}
                onScreenshotClick={handleScreenshotClick}
              />
            </SlideOverSection>
          )}
        </div>
      )}
    </SlideOver>
  );
}
