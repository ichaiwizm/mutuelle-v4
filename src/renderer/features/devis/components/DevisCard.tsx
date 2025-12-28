import { FileText, Download, Copy, Clock, Trash2, MoreVertical, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";
import { Card } from "@/renderer/components/ui/Card";
import type { DevisWithLead } from "@/shared/ipc/contracts";
import type { DevisStatus } from "@/shared/types/devis";
import { getBestPrice } from "../utils/formatDevisData";
import { useState, useRef, useEffect } from "react";

interface DevisCardProps {
  devis: DevisWithLead;
  onView: (devis: DevisWithLead) => void;
  onExportPdf: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMarkExpired: (id: string) => void;
  onDelete: (devis: DevisWithLead) => void;
}

/**
 * Status badge styles and icons
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
 * Dropdown menu for card actions
 */
function ActionMenu({
  devis,
  onExportPdf,
  onDuplicate,
  onMarkExpired,
  onDelete,
}: Omit<DevisCardProps, "onView">) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          {devis.pdfPath && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-hover)]"
              onClick={(e) => {
                e.stopPropagation();
                onExportPdf(devis.id);
                setIsOpen(false);
              }}
            >
              <Download className="h-4 w-4" />
              Exporter PDF
            </button>
          )}
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-hover)]"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(devis.id);
              setIsOpen(false);
            }}
          >
            <Copy className="h-4 w-4" />
            Dupliquer
          </button>
          {devis.status !== "expired" && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-hover)]"
              onClick={(e) => {
                e.stopPropagation();
                onMarkExpired(devis.id);
                setIsOpen(false);
              }}
            >
              <Clock className="h-4 w-4" />
              Marquer expiré
            </button>
          )}
          <div className="border-t border-[var(--color-border)]" />
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(devis);
              setIsOpen(false);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Devis card component
 */
export function DevisCard({
  devis,
  onView,
  onExportPdf,
  onDuplicate,
  onMarkExpired,
  onDelete,
}: DevisCardProps) {
  const status = STATUS_CONFIG[devis.status];
  const StatusIcon = status.icon;
  const price = getBestPrice(devis.data);
  const formuleName = devis.data?.formuleName;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card
      className="p-4 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
      onClick={() => onView(devis)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--color-text-muted)]" />
          <span className="font-medium text-sm">
            {devis.productName || devis.flowKey}
          </span>
        </div>
        <ActionMenu
          devis={devis}
          onExportPdf={onExportPdf}
          onDuplicate={onDuplicate}
          onMarkExpired={onMarkExpired}
          onDelete={onDelete}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Formula name */}
        {formuleName && (
          <p className="text-sm text-[var(--color-text-secondary)]">{formuleName}</p>
        )}

        {/* Price */}
        {price && (
          <p className="text-2xl font-bold text-[var(--color-primary)]">{price}</p>
        )}

        {/* Error message */}
        {devis.errorMessage && (
          <p className="text-sm text-[var(--color-error)] line-clamp-2">
            {devis.errorMessage}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
        >
          <StatusIcon className={`h-3 w-3 ${devis.status === "pending" ? "animate-spin" : ""}`} />
          {status.label}
        </span>

        {/* Date */}
        <span className="text-xs text-[var(--color-text-muted)]">
          {formatDate(devis.createdAt)}
        </span>
      </div>

      {/* PDF indicator */}
      {devis.pdfPath && (
        <div className="flex items-center gap-1 mt-2 text-xs text-[var(--color-text-muted)]">
          <FileText className="h-3 w-3" />
          PDF disponible
        </div>
      )}
    </Card>
  );
}
