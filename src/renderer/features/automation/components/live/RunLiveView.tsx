import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/renderer/components/ui/Card";
import { Button } from "@/renderer/components/ui/Button";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import {
  ArrowLeft,
  XCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Folder,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { FlowProgressCard } from "./FlowProgressCard";
import { ScreenshotLightbox } from "./ScreenshotLightbox";
import { useFlowProgress, type LiveItemState } from "../../hooks/useFlowProgress";
import type { Run, RunItem } from "@/shared/types/run";

type RunLiveViewProps = {
  runId: string;
  onBack?: () => void;
};

type Screenshot = {
  path: string;
  stepName: string;
  stepId: string;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function RunStatusBadge({ status }: { status: Run["status"] }) {
  const config = {
    queued: {
      icon: Clock,
      label: "En attente",
      className: "bg-zinc-800 text-zinc-300",
    },
    running: {
      icon: Loader2,
      label: "En cours",
      className: "bg-cyan-500/20 text-cyan-400",
      iconClass: "animate-spin",
    },
    done: {
      icon: CheckCircle2,
      label: "Terminé",
      className: "bg-emerald-500/20 text-emerald-400",
    },
    failed: {
      icon: XCircle,
      label: "Échoué",
      className: "bg-red-500/20 text-red-400",
    },
    cancelled: {
      icon: XCircle,
      label: "Annulé",
      className: "bg-zinc-800 text-zinc-400",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        config.className
      )}
    >
      <Icon className={cn("h-4 w-4", (config as any).iconClass)} />
      {config.label}
    </div>
  );
}

export function RunLiveView({ runId, onBack }: RunLiveViewProps) {
  const navigate = useNavigate();
  const [runData, setRunData] = useState<(Run & { items: RunItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxScreenshots, setLightboxScreenshots] = useState<Screenshot[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  // Get live progress
  const { getRun, getRunItems } = useFlowProgress({ runId });
  const liveRun = getRun(runId);
  const liveItems = getRunItems(runId);

  // Fetch run data from database
  const fetchRunData = useCallback(async () => {
    try {
      const data = await window.api.automation.get(runId);
      setRunData(data);
    } catch (error) {
      console.error("Failed to fetch run data:", error);
    } finally {
      setLoading(false);
    }
  }, [runId]);

  // Initial fetch
  useEffect(() => {
    fetchRunData();
  }, [fetchRunData]);

  // Poll for updates while the run is active (handles missed IPC events)
  useEffect(() => {
    // Determine if we should poll
    const shouldPoll =
      runData?.status === "queued" ||
      runData?.status === "running" ||
      liveRun?.status === "running";

    if (!shouldPoll) return;

    const interval = setInterval(() => {
      fetchRunData();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [runData?.status, liveRun?.status, fetchRunData]);

  // Refresh when live run completes
  useEffect(() => {
    if (liveRun?.status === "completed" || liveRun?.status === "failed") {
      fetchRunData();
    }
  }, [liveRun?.status, fetchRunData]);

  // Merge live data with database data
  // Database is the source of truth (polled every 2s), live data supplements for responsiveness
  const mergedItems: LiveItemState[] = useMemo(() => {
    // Convert database items to LiveItemState
    const dbItems: LiveItemState[] = (runData?.items ?? []).map((item) => ({
      itemId: item.id,
      flowKey: item.flowKey,
      leadId: item.leadId,
      status: item.status as LiveItemState["status"],
      steps: item.stepsData?.steps ?? [],
      currentStepIndex: item.stepsData?.currentStepIndex ?? 0,
      startedAt: item.startedAt ? new Date(item.startedAt).getTime() : undefined,
      completedAt: item.completedAt ? new Date(item.completedAt).getTime() : undefined,
      error: item.errorMessage ?? undefined,
    }));

    // If no database items yet, use live items
    if (dbItems.length === 0 && liveItems.length > 0) {
      return liveItems;
    }

    // Merge: use DB as base, but update with live data for running items
    // This gives instant feedback while maintaining DB as source of truth
    const liveItemsMap = new Map(liveItems.map((li) => [li.itemId, li]));

    return dbItems.map((dbItem) => {
      const liveItem = liveItemsMap.get(dbItem.itemId);

      // If live item has more progress (higher step index), use its steps data
      if (liveItem && liveItem.currentStepIndex > dbItem.currentStepIndex) {
        return {
          ...dbItem,
          steps: liveItem.steps,
          currentStepIndex: liveItem.currentStepIndex,
          status: liveItem.status,
        };
      }

      return dbItem;
    });
  }, [liveItems, runData]);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = mergedItems.filter((i) => i.status === "completed").length;
    const failed = mergedItems.filter((i) => i.status === "failed").length;
    const running = mergedItems.filter((i) => i.status === "running").length;
    const total = mergedItems.length;

    return { completed, failed, running, total };
  }, [mergedItems]);

  // Collect all screenshots
  const allScreenshots = useMemo(() => {
    const screenshots: Screenshot[] = [];

    for (const item of mergedItems) {
      for (const step of item.steps) {
        if (step.screenshot) {
          screenshots.push({
            path: step.screenshot,
            stepName: `${item.flowKey} - ${step.name}`,
            stepId: step.id,
          });
        }
      }
    }

    return screenshots;
  }, [mergedItems]);

  // Handle screenshot click
  const handleScreenshotClick = useCallback(
    (screenshotPath: string) => {
      const index = allScreenshots.findIndex((s) => s.path === screenshotPath);
      if (index !== -1) {
        setLightboxScreenshots(allScreenshots);
        setLightboxInitialIndex(index);
        setLightboxOpen(true);
      }
    },
    [allScreenshots]
  );

  // Handle cancel
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await window.api.automation.cancel(runId);
      await fetchRunData();
    } catch (error) {
      console.error("Failed to cancel run:", error);
    } finally {
      setCancelling(false);
    }
  };

  // Handle back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/automation");
    }
  };

  const isRunning = runData?.status === "running" || liveRun?.status === "running";
  const status = liveRun?.status === "running" ? "running" : runData?.status ?? "queued";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <div className="h-6 w-px bg-[var(--color-border)]" />

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Exécution en cours
                </h1>
                <RunStatusBadge status={status} />
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5 font-mono">
                {runId.slice(0, 8)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <Button variant="secondary" size="sm" onClick={fetchRunData}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>

            {/* Screenshots button */}
            {allScreenshots.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setLightboxScreenshots(allScreenshots);
                  setLightboxInitialIndex(0);
                  setLightboxOpen(true);
                }}
              >
                <ImageIcon className="h-4 w-4" />
                {allScreenshots.length} captures
              </Button>
            )}

            {/* Cancel button */}
            {isRunning && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
                className="text-red-400 hover:text-red-300"
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Annuler
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.total}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">tâches</span>
          </div>

          <div className="h-6 w-px bg-[var(--color-border)]" />

          <div className="flex items-center gap-4">
            {stats.running > 0 && (
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-cyan-400">{stats.running} en cours</span>
              </div>
            )}

            {stats.completed > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">{stats.completed} terminées</span>
              </div>
            )}

            {stats.failed > 0 && (
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">{stats.failed} échouées</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                isRunning
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500"
                  : stats.failed > 0
                    ? "bg-red-500"
                    : "bg-emerald-500"
              )}
              style={{
                width: `${stats.total > 0 ? ((stats.completed + stats.failed) / stats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && mergedItems.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : mergedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clock className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-[var(--color-text-muted)]">
              En attente de démarrage...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mergedItems.map((item) => (
              <FlowProgressCard
                key={item.itemId}
                item={item}
                onScreenshotClick={handleScreenshotClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <ScreenshotLightbox
        screenshots={lightboxScreenshots}
        initialIndex={lightboxInitialIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
