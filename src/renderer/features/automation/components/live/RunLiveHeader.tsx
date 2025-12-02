import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/renderer/components/ui/Button";
import { StatCard } from "@/renderer/components/ui/StatCard";
import {
  ArrowLeft,
  RefreshCw,
  XCircle,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Run } from "@/shared/types/run";

type RunLiveHeaderProps = {
  runId: string;
  status: Run["status"];
  stats: {
    total: number;
    completed: number;
    failed: number;
    running: number;
    cancelled: number;
  };
  isRunning: boolean;
  cancelling?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onBack: () => void;
  onRefresh: () => void;
};

function RunStatusBadge({ status }: { status: Run["status"] }) {
  const config = {
    queued: {
      icon: Clock,
      label: "En attente",
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    running: {
      icon: Loader2,
      label: "En cours",
      className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      iconClass: "animate-spin",
    },
    done: {
      icon: CheckCircle2,
      label: "Terminé",
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    failed: {
      icon: XCircle,
      label: "Échoué",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    cancelled: {
      icon: XCircle,
      label: "Annulé",
      className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border",
        config.className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", (config as any).iconClass)} />
      {config.label}
    </div>
  );
}

export function RunLiveHeader({
  runId,
  status,
  stats,
  isRunning,
  cancelling,
  loading,
  onCancel,
  onBack,
  onRefresh,
}: RunLiveHeaderProps) {
  const overallProgress = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round(
      ((stats.completed + stats.failed + stats.cancelled) / stats.total) * 100
    );
  }, [stats]);

  const progressColor = useMemo(() => {
    if (isRunning) return "var(--color-info)";
    if (stats.cancelled > 0) return "var(--color-warning)";
    if (stats.failed > 0 && stats.failed === stats.total) return "var(--color-error)";
    if (stats.failed > 0) return "var(--color-warning)";
    return "var(--color-success)";
  }, [isRunning, stats.failed, stats.cancelled, stats.total]);

  return (
    <div className="flex-shrink-0 border-b border-[var(--color-border)]">
      {/* Top bar with navigation and actions */}
      <div className="px-6 py-4 bg-[var(--color-surface)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          <div className="h-6 w-px bg-[var(--color-border)]" />

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)] font-display">
                {isRunning ? "Exécution en cours" : "Détail de l'exécution"}
              </h1>
              <RunStatusBadge status={status} />
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5 font-mono">
              {runId.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onRefresh} title="Rafraîchir">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          {isRunning && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={cancelling}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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

      {/* Stats bar */}
      <div className="px-6 py-4 bg-[var(--color-background)]">
        <div className="flex items-center gap-4">
          {/* Progress Bar - compact horizontal */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-surface)] min-w-[140px]">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isRunning && "progress-shine"
                )}
                style={{
                  width: `${overallProgress}%`,
                  backgroundColor: progressColor,
                }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
              {overallProgress}%
            </span>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-5 gap-3">
            <StatCard
              label="Total"
              value={stats.total}
              variant="default"
              size="compact"
            />
            <StatCard
              label="En cours"
              value={stats.running}
              variant="info"
              size="compact"
              pulse={stats.running > 0}
            />
            <StatCard
              label="Terminées"
              value={stats.completed}
              variant="success"
              size="compact"
            />
            <StatCard
              label="Échouées"
              value={stats.failed}
              variant="error"
              size="compact"
            />
            <StatCard
              label="Annulées"
              value={stats.cancelled}
              variant="warning"
              size="compact"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
