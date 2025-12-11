import { useState } from "react";
import { Database, Download, HardDrive, FolderOpen, CheckCircle, XCircle, Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";

const APP_VERSION = "0.1.0-beta.1";

type ExportStatus = "idle" | "loading" | "success" | "error" | "cancelled" | "no_data";
type FeedbackStatus = "idle" | "loading" | "success" | "error";

interface ExportState {
  status: ExportStatus;
  message?: string;
}

interface FeedbackState {
  status: FeedbackStatus;
  message?: string;
}

export function DataSection() {
  const [leadsExport, setLeadsExport] = useState<ExportState>({ status: "idle" });
  const [dbExport, setDbExport] = useState<ExportState>({ status: "idle" });
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({ status: "idle" });
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleExportLeads = async () => {
    setLeadsExport({ status: "loading" });
    try {
      const result = await window.api.data.exportLeads();
      if (result.exported) {
        setLeadsExport({
          status: "success",
          message: `${result.count} leads exportés`,
        });
      } else if (result.reason === "CANCELLED") {
        setLeadsExport({ status: "cancelled" });
      } else if (result.reason === "NO_LEADS") {
        setLeadsExport({ status: "no_data", message: "Aucun lead à exporter" });
      }
    } catch (error) {
      setLeadsExport({
        status: "error",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  const handleExportDb = async () => {
    setDbExport({ status: "loading" });
    try {
      const result = await window.api.data.exportDb();
      if (result.exported) {
        setDbExport({ status: "success", message: "Base de données sauvegardée" });
      } else if (result.reason === "CANCELLED") {
        setDbExport({ status: "cancelled" });
      }
    } catch (error) {
      setDbExport({
        status: "error",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  const handleOpenLogsFolder = async () => {
    try {
      const result = await window.api.data.getLogsPath();
      await window.api.shell.openPath(result.path);
    } catch (error) {
      console.error("Failed to open logs folder:", error);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) return;

    setFeedbackState({ status: "loading" });
    try {
      const result = await window.api.feedback.send({
        message: `[v${APP_VERSION}] ${feedbackMessage}`,
        email: feedbackEmail || undefined,
      });

      if (result.sent) {
        setFeedbackState({ status: "success", message: "Feedback envoyé !" });
        setFeedbackMessage("");
        setFeedbackEmail("");
        setTimeout(() => {
          setShowFeedbackForm(false);
          setFeedbackState({ status: "idle" });
        }, 2000);
      } else {
        setFeedbackState({ status: "success", message: "Feedback enregistré (mode dev)" });
        setFeedbackMessage("");
        setTimeout(() => {
          setShowFeedbackForm(false);
          setFeedbackState({ status: "idle" });
        }, 2000);
      }
    } catch (error) {
      setFeedbackState({
        status: "error",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  const renderStatus = (state: ExportState) => {
    switch (state.status) {
      case "loading":
        return (
          <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Export en cours...
          </span>
        );
      case "success":
        return (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            {state.message}
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 text-sm text-red-400">
            <XCircle className="h-4 w-4" />
            {state.message}
          </span>
        );
      case "cancelled":
        return (
          <span className="text-sm text-[var(--color-text-muted)]">
            Export annulé
          </span>
        );
      case "no_data":
        return (
          <span className="text-sm text-amber-400">
            {state.message}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Database className="h-5 w-5 text-[var(--color-text-muted)]" />
        <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
          Gestion des données
        </h2>
      </div>

      {/* Export Cards */}
      <div className="space-y-4">
        {/* Export Leads */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                <Download className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)]">
                  Exporter les leads
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  Téléchargez tous vos leads au format JSON
                </p>
                {leadsExport.status !== "idle" && (
                  <div className="mt-2">{renderStatus(leadsExport)}</div>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportLeads}
              disabled={leadsExport.status === "loading"}
            >
              Exporter
            </Button>
          </div>
        </div>

        {/* Export Database */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <HardDrive className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)]">
                  Sauvegarder la base de données
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  Créez une copie complète de la base SQLite
                </p>
                {dbExport.status !== "idle" && (
                  <div className="mt-2">{renderStatus(dbExport)}</div>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportDb}
              disabled={dbExport.status === "loading"}
            >
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Open Logs Folder */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <FolderOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)]">
                  Dossier des logs
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  Ouvrez le dossier contenant les fichiers de log
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleOpenLogsFolder}>
              Ouvrir
            </Button>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="flex items-center gap-3 pt-6">
        <MessageSquare className="h-5 w-5 text-[var(--color-text-muted)]" />
        <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
          Feedback Beta
        </h2>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        {!showFeedbackForm ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)]/20">
                <MessageSquare className="h-5 w-5 text-[var(--color-info)]" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)]">
                  Envoyer un feedback
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  Signalez un bug, suggérez une amélioration ou partagez vos impressions
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  Version {APP_VERSION}
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowFeedbackForm(true)}>
              Écrire
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)]/20">
                <MessageSquare className="h-5 w-5 text-[var(--color-info)]" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)]">
                  Envoyer un feedback
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Version {APP_VERSION}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Votre message *
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Décrivez votre feedback, bug ou suggestion..."
                  className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  disabled={feedbackState.status === "loading"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="Pour vous recontacter si besoin"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  disabled={feedbackState.status === "loading"}
                />
              </div>

              {feedbackState.status === "success" && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  {feedbackState.message}
                </div>
              )}

              {feedbackState.status === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <XCircle className="h-4 w-4" />
                  {feedbackState.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setFeedbackState({ status: "idle" });
                  }}
                  disabled={feedbackState.status === "loading"}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendFeedback}
                  disabled={!feedbackMessage.trim() || feedbackState.status === "loading"}
                >
                  {feedbackState.status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="pt-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          Les exports ne contiennent pas vos identifiants de connexion (chiffrés séparément).
          <br />
          Nous recommandons de faire une sauvegarde régulière de vos données.
        </p>
      </div>
    </div>
  );
}
