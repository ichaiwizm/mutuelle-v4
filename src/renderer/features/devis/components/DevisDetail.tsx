import { useState } from "react";
import {
  FileText,
  Download,
  Copy,
  Clock,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Save,
  ExternalLink,
} from "lucide-react";
import { SlideOver } from "@/renderer/components/ui/SlideOver/SlideOver";
import { Button } from "@/renderer/components/ui/Button";
import { Textarea } from "@/renderer/components/ui/Input";
import type { DevisWithLead } from "@/shared/ipc/contracts";
import type { DevisStatus } from "@/shared/types/devis";
import type { ReactNode } from "react";
import { formatDevisData, getBestPrice } from "../utils/formatDevisData";

/**
 * Section component for SlideOver content
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-4 border-b border-[var(--color-border)] last:border-b-0">
      <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/**
 * Data row component for key-value display
 */
function DataRow({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="flex justify-between items-start text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="text-[var(--color-text-primary)] text-right max-w-[60%]">{value}</span>
    </div>
  );
}

interface DevisDetailProps {
  devis: DevisWithLead | null;
  open: boolean;
  onClose: () => void;
  onExportPdf: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMarkExpired: (id: string) => void;
  onDelete: (devis: DevisWithLead) => void;
  onUpdateNotes: (id: string, notes: string) => Promise<void>;
}

/**
 * Status badge config
 */
const STATUS_CONFIG: Record<
  DevisStatus,
  { label: string; icon: typeof CheckCircle; className: string }
> = {
  pending: {
    label: "En attente",
    icon: Loader2,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  completed: {
    label: "Complété",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  failed: {
    label: "Échoué",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  expired: {
    label: "Expiré",
    icon: AlertCircle,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

/**
 * Format date to French locale
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * DevisDetail SlideOver component
 */
export function DevisDetail({
  devis,
  open,
  onClose,
  onExportPdf,
  onDuplicate,
  onMarkExpired,
  onDelete,
  onUpdateNotes,
}: DevisDetailProps) {
  const [notes, setNotes] = useState(devis?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesChanged, setNotesChanged] = useState(false);

  // Reset notes when devis changes
  if (devis && notes !== (devis.notes || "") && !notesChanged) {
    setNotes(devis.notes || "");
  }

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesChanged(true);
  };

  const handleSaveNotes = async () => {
    if (!devis) return;
    setSavingNotes(true);
    try {
      await onUpdateNotes(devis.id, notes);
      setNotesChanged(false);
    } finally {
      setSavingNotes(false);
    }
  };

  if (!devis) return null;

  const status = STATUS_CONFIG[devis.status];
  const StatusIcon = status.icon;
  const price = getBestPrice(devis.data);
  const formattedData = formatDevisData(devis.data);

  return (
    <SlideOver open={open} onClose={onClose} title="Détail du devis" width="lg">
      {/* Header with status and actions */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.className}`}
          >
            <StatusIcon
              className={`h-4 w-4 ${devis.status === "pending" ? "animate-spin" : ""}`}
            />
            {status.label}
          </span>
          {price && (
            <span className="text-xl font-bold text-[var(--color-primary)]">{price}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {devis.pdfPath && (
            <Button variant="secondary" size="sm" onClick={() => onExportPdf(devis.id)}>
              <Download className="h-4 w-4 mr-1" />
              Exporter PDF
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(devis.id)}>
            <Copy className="h-4 w-4" />
          </Button>
          {devis.status !== "expired" && (
            <Button variant="ghost" size="sm" onClick={() => onMarkExpired(devis.id)}>
              <Clock className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--color-error)]"
            onClick={() => onDelete(devis)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Informations générales */}
      <Section title="Informations">
        <DataRow label="Produit" value={devis.productName || devis.flowKey} />
        {devis.leadName && <DataRow label="Lead" value={devis.leadName} />}
        <DataRow label="Créé le" value={formatDate(devis.createdAt)} />
        <DataRow label="Modifié le" value={formatDate(devis.updatedAt)} />
        {devis.expiresAt && (
          <DataRow label="Expire le" value={formatDate(devis.expiresAt)} />
        )}
      </Section>

      {/* Lien vers la plateforme */}
      {devis.data?.devisUrl && (
        <Section title="Plateforme">
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.api.shell.openExternal(devis.data!.devisUrl as string)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir sur la plateforme
            </Button>
            <p className="text-xs text-[var(--color-text-muted)]">
              Modifier les garanties directement sur la plateforme
            </p>
          </div>
        </Section>
      )}

      {/* Données du devis */}
      {formattedData.length > 0 && (
        <Section title="Données du devis">
          {formattedData
            .filter(({ key }) => key !== "devisUrl" && key !== "quoteReference")
            .map(({ key, label, value }) => (
            <DataRow key={key} label={label} value={value} />
          ))}
        </Section>
      )}

      {/* Error message */}
      {devis.errorMessage && (
        <Section title="Erreur">
          <div className="p-3 rounded-md bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm">
            {devis.errorMessage}
          </div>
        </Section>
      )}

      {/* PDF indicator */}
      {devis.pdfPath && (
        <Section title="Document">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <FileText className="h-4 w-4" />
            <span>PDF disponible</span>
          </div>
        </Section>
      )}

      {/* Notes */}
      <Section title="Notes">
        <div className="space-y-2">
          <Textarea
            placeholder="Ajouter des notes..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={4}
          />
          {notesChanged && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Enregistrer
              </Button>
            </div>
          )}
        </div>
      </Section>
    </SlideOver>
  );
}
