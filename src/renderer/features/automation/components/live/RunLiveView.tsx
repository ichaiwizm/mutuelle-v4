import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RunLiveHeader } from "./RunLiveHeader";
import { FlowsTable } from "./FlowsTable";
import { FlowDetailSlideOver } from "./FlowDetailSlideOver";
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

export function RunLiveView({ runId, onBack }: RunLiveViewProps) {
  const navigate = useNavigate();
  const [runData, setRunData] = useState<(Run & { items: RunItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Selection state for hybrid view
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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
    const shouldPoll =
      runData?.status === "queued" ||
      runData?.status === "running" ||
      liveRun?.status === "running";

    if (!shouldPoll) return;

    const interval = setInterval(() => {
      fetchRunData();
    }, 2000);

    return () => clearInterval(interval);
  }, [runData?.status, liveRun?.status, fetchRunData]);

  // Refresh when live run completes or is cancelled
  useEffect(() => {
    if (
      liveRun?.status === "completed" ||
      liveRun?.status === "failed" ||
      liveRun?.status === "cancelled"
    ) {
      fetchRunData();
    }
  }, [liveRun?.status, fetchRunData]);

  // Merge live data with database data
  const mergedItems: LiveItemState[] = useMemo(() => {
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

    if (dbItems.length === 0 && liveItems.length > 0) {
      return liveItems;
    }

    const liveItemsMap = new Map(liveItems.map((li) => [li.itemId, li]));

    return dbItems.map((dbItem) => {
      const liveItem = liveItemsMap.get(dbItem.itemId);

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
    const cancelled = mergedItems.filter((i) => i.status === "cancelled").length;
    const total = mergedItems.length;

    return { completed, failed, running, cancelled, total };
  }, [mergedItems]);

  // Get selected item
  const selectedItem = useMemo(() => {
    return selectedItemId ? mergedItems.find((i) => i.itemId === selectedItemId) ?? null : null;
  }, [selectedItemId, mergedItems]);

  // Handle screenshot click from SlideOver (scoped to selected flow)
  const handleFlowScreenshotClick = useCallback(
    (screenshot: Screenshot) => {
      if (!selectedItem) return;

      // Get screenshots only for the selected flow
      const flowScreenshots = selectedItem.steps
        .filter((s) => s.screenshot)
        .map((s) => ({
          path: s.screenshot!,
          stepName: s.name,
          stepId: s.id,
        }));

      const index = flowScreenshots.findIndex((s) => s.path === screenshot.path);
      setLightboxScreenshots(flowScreenshots);
      setLightboxInitialIndex(index >= 0 ? index : 0);
      setLightboxOpen(true);
    },
    [selectedItem]
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

  // Handle item selection
  const handleSelectItem = (itemId: string) => {
    setSelectedItemId((prev) => (prev === itemId ? null : itemId));
  };

  const isRunning = runData?.status === "running" || liveRun?.status === "running";
  const status = liveRun?.status === "running" ? "running" : runData?.status ?? "queued";

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header with animated stats */}
      <RunLiveHeader
        runId={runId}
        status={status}
        stats={stats}
        isRunning={isRunning}
        cancelling={cancelling}
        loading={loading}
        onCancel={handleCancel}
        onBack={handleBack}
        onRefresh={fetchRunData}
      />

      {/* Table content */}
      <div className="flex-1 overflow-hidden">
        <FlowsTable
          items={mergedItems}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
          loading={loading}
        />
      </div>

      {/* Detail SlideOver */}
      <FlowDetailSlideOver
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItemId(null)}
        onScreenshotClick={handleFlowScreenshotClick}
      />

      {/* Lightbox (now scoped to selected flow) */}
      <ScreenshotLightbox
        screenshots={lightboxScreenshots}
        initialIndex={lightboxInitialIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
