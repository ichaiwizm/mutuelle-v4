import { useMemo, useState, useCallback } from "react";
import { SlideOver } from "@/renderer/components/ui/SlideOver";
import { SlideOverSection } from "@/renderer/components/ui/SlideOver/SlideOverSection";
import { Card } from "@/renderer/components/ui/Card";
import { StatusIndicator } from "../shared/StatusIndicator";
import { LiveStepTimeline } from "./LiveStepTimeline";
import { FlowScreenshotGallery } from "./FlowScreenshotGallery";
import { LeadDetails } from "@/renderer/features/leads/components/LeadDetails";
import {
  Clock,
  Calendar,
  AlertCircle,
  User,
  Activity,
  ChevronRight,
  ExternalLink,
  Hand,
} from "lucide-react";
import type { LiveItemState } from "../../hooks/useFlowProgress";
import type { Lead } from "@/shared/types/lead";

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

function ClickableInfoRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between py-2.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] transition-colors -mx-4 px-4"
    >
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-[var(--color-primary)] underline underline-offset-2">
          {value}
        </span>
        <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
      </div>
    </button>
  );
}

export function FlowDetailSlideOver({
  item,
  open,
  onClose,
  onScreenshotClick,
}: FlowDetailSlideOverProps) {
  // Lead details state
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);
  const [isBringingToFront, setIsBringingToFront] = useState(false);

  // Handle lead click - fetch and show details
  const handleLeadClick = useCallback(async () => {
    if (!item?.leadId) return;
    setLoadingLead(true);
    try {
      const lead = await window.api.leads.get(item.leadId);
      if (lead) {
        setViewingLead(lead);
      }
    } catch (e) {
      console.error("Failed to fetch lead:", e);
    } finally {
      setLoadingLead(false);
    }
  }, [item?.leadId]);

  // Close lead details
  const handleCloseLeadDetails = useCallback(() => {
    setViewingLead(null);
  }, []);

  // Handle bring to front
  const handleBringToFront = useCallback(async () => {
    if (!item?.itemId) return;
    setIsBringingToFront(true);
    try {
      await window.api.automation.bringToFront(item.itemId);
    } catch (err) {
      console.error("Failed to bring window to front:", err);
    } finally {
      setIsBringingToFront(false);
    }
  }, [item?.itemId]);

  // Calculate step counts
  const { completedSteps, totalSteps } = useMemo(() => {
    if (!item) return { completedSteps: 0, totalSteps: 0 };
    const completed = item.steps.filter(
      (s) => s.status === "completed" || s.status === "skipped"
    ).length;
    const total = item.steps.length;
    return {
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

  // Map status for StatusIndicator
  const statusForIndicator = item?.status === "completed" ? "done" : item?.status;

  const handleScreenshotClick = (screenshot: Screenshot) => {
    onScreenshotClick(screenshot);
  };

  const isRunning = item?.status === "running";
  const isWaitingUser = item?.status === "waiting_user";

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={flowName}
      description={item?.leadName || ""}
      width="lg"
    >
      {item && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <StatusIndicator status={statusForIndicator as any} showLabel size="md" />
              {isRunning && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10">
                  <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
                  <span className="text-xs text-cyan-400 font-medium">Live</span>
                </div>
              )}
              {isWaitingUser && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10">
                  <Hand className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-orange-400 font-medium">En attente</span>
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
          </Card>

          {/* Waiting User Action */}
          {isWaitingUser && (
            <Card className="p-4 bg-orange-500/5 border-orange-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Hand className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Le navigateur attend votre intervention
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Cliquez sur le bouton pour mettre la fenêtre au premier plan.
                    Fermez le navigateur une fois terminé pour valider.
                  </p>
                  <button
                    onClick={handleBringToFront}
                    disabled={isBringingToFront}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isBringingToFront ? "Ouverture..." : "Mettre au premier plan"}
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Info Section */}
          <SlideOverSection title="Informations">
            <Card className="p-0 overflow-hidden">
              <div className="px-4">
                <ClickableInfoRow
                  icon={User}
                  label="Lead"
                  value={loadingLead ? "Chargement..." : (item.leadName || "Lead inconnu")}
                  onClick={handleLeadClick}
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

      {/* Lead Details SlideOver */}
      <SlideOver
        open={!!viewingLead}
        onClose={handleCloseLeadDetails}
        title="Détails du lead"
        description={
          viewingLead
            ? `${viewingLead.subscriber.prenom} ${viewingLead.subscriber.nom?.toUpperCase()}`
            : undefined
        }
        width="lg"
      >
        {viewingLead && (
          <LeadDetails
            lead={viewingLead}
            onEdit={handleCloseLeadDetails}
            onClose={handleCloseLeadDetails}
          />
        )}
      </SlideOver>
    </SlideOver>
  );
}
