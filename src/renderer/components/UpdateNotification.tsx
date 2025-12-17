import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import type { UpdateStatus } from "@/shared/ipc/contracts";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

export function UpdateNotification() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = window.api.update.onStatus((newStatus) => {
      console.log("[UPDATE_UI]", newStatus);
      setStatus(newStatus);
      setDismissed(false);

      // Show animation after a tiny delay for smooth entrance
      if (newStatus.state === "available" || newStatus.state === "downloading" || newStatus.state === "ready") {
        setTimeout(() => setIsVisible(true), 50);
      }
    });

    return unsubscribe;
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      await window.api.update.download();
    } catch (err) {
      console.error("[UPDATE_UI] Download failed:", err);
    }
  }, []);

  const handleInstall = useCallback(async () => {
    try {
      await window.api.update.install();
    } catch (err) {
      console.error("[UPDATE_UI] Install failed:", err);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setDismissed(true), 300);
  }, []);

  // Don't show anything if dismissed or no relevant status
  if (dismissed) return null;
  if (!status) return null;
  if (status.state === "checking" || status.state === "not-available") return null;

  // Error state - show briefly then auto-dismiss
  if (status.state === "error") {
    return (
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-surface)] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-error-muted)]">
            <AlertCircle className="h-5 w-5 text-[var(--color-error)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Erreur de mise à jour
            </span>
            <span className="text-xs text-[var(--color-text-muted)] max-w-[200px] truncate">
              {status.message}
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Update available
  if (status.state === "available") {
    return (
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/25">
          {/* Subtle gradient accent at top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />

          <div className="relative px-5 py-4">
            <div className="flex items-start gap-4">
              {/* Icon with glow effect */}
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-xl bg-[var(--color-primary)] opacity-20 blur-lg" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
                    Nouvelle version disponible
                  </h3>
                  <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                    v{status.version}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Des améliorations et corrections sont prêtes
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-xs font-medium text-white transition-all duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
                  >
                    Plus tard
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Downloading
  if (status.state === "downloading") {
    const percent = status.percent;

    return (
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/25">
          {/* Progress bar at top */}
          <div className="h-1 bg-[var(--color-border)]">
            <div
              className="progress-shine h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)] transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-4">
              {/* Animated download icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-info-muted)]">
                <Download className="h-5 w-5 animate-pulse text-[var(--color-info)]" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
                    Téléchargement en cours
                  </h3>
                  <span className="tabular-nums text-sm font-semibold text-[var(--color-primary)]">
                    {percent}%
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                  <span className="tabular-nums">
                    {formatBytes(status.transferred)} / {formatBytes(status.total)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-[var(--color-border)]" />
                  <span className="tabular-nums">{formatSpeed(status.bytesPerSecond)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ready to install
  if (status.state === "ready") {
    return (
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-success)]/20 bg-[var(--color-surface)] shadow-2xl shadow-black/25">
          {/* Success accent at top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-success)] to-transparent" />

          <div className="relative px-5 py-4">
            <div className="flex items-start gap-4">
              {/* Success icon */}
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-xl bg-[var(--color-success)] opacity-20 blur-lg" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-success)] to-emerald-600">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
                    Mise à jour prête
                  </h3>
                  <span className="rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
                    v{status.version}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Redémarrez pour appliquer la mise à jour
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-success)] px-3.5 py-2 text-xs font-medium text-white transition-all duration-150 hover:bg-emerald-600 active:scale-[0.98]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Redémarrer maintenant
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
                  >
                    Plus tard
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
