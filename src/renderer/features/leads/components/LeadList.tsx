import { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/renderer/components/ui/Table";
import { Button } from "@/renderer/components/ui/Button";
import { Card } from "@/renderer/components/ui/Card";
import { EmptyState } from "@/renderer/components/ui/EmptyState";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import { Eye, Edit2, Trash2, Users, Baby, Check, Minus } from "lucide-react";
import type { Lead } from "@/shared/types/lead";
import { parseLeadRow, type LeadRow } from "../hooks/useLeads";

/**
 * Custom Checkbox component
 */
function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`
        w-4 h-4 rounded border flex items-center justify-center transition-all
        ${
          checked || indeterminate
            ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
            : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
        }
      `}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
      {indeterminate && !checked && <Minus className="w-3 h-3 text-white" />}
    </button>
  );
}

interface LeadListProps {
  leads: LeadRow[];
  loading?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

/**
 * Format date from ISO to readable format
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Lead List Component
 */
export function LeadList({
  leads,
  loading,
  selectedIds = new Set(),
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: LeadListProps) {
  // Parse all leads (using shared parseLeadRow with error handling)
  const parsedLeads = useMemo(() => {
    return leads.map((row) => ({
      row,
      lead: parseLeadRow(row),
    }));
  }, [leads]);

  // Check if all visible leads are selected
  const allSelected = parsedLeads.length > 0 && parsedLeads.every(({ row }) => selectedIds.has(row.id));
  const someSelected = parsedLeads.some(({ row }) => selectedIds.has(row.id));

  // Handle select all toggle
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      // Deselect all visible leads
      const newSelection = new Set(selectedIds);
      parsedLeads.forEach(({ row }) => newSelection.delete(row.id));
      onSelectionChange(newSelection);
    } else {
      // Select all visible leads
      const newSelection = new Set(selectedIds);
      parsedLeads.forEach(({ row }) => newSelection.add(row.id));
      onSelectionChange(newSelection);
    }
  };

  // Handle individual row toggle
  const handleToggleRow = (id: string) => {
    if (!onSelectionChange) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (parsedLeads.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="Aucun lead pour le moment"
        description="Les leads sont vos prospects. Créez-en un manuellement ou importez-les depuis Gmail pour commencer à automatiser vos souscriptions."
        action={{
          label: "Créer un lead",
          onClick: onCreate,
        }}
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Nom</TableHead>
            <TableHead>Date de naissance</TableHead>
            <TableHead>Code postal</TableHead>
            <TableHead>Profession</TableHead>
            <TableHead>Composition</TableHead>
            <TableHead>Date d'effet</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsedLeads.map(({ row, lead }) => (
            <TableRow
              key={row.id}
              className={`hover:bg-[var(--color-surface-hover)] ${
                selectedIds.has(row.id) ? "bg-[var(--color-primary)]/5" : ""
              }`}
            >
              {onSelectionChange && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onChange={() => handleToggleRow(row.id)}
                  />
                </TableCell>
              )}
              {/* Nom complet */}
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {lead.subscriber.civilite && (
                    <span className="text-[var(--color-text-muted)]">
                      {lead.subscriber.civilite}.
                    </span>
                  )}
                  <span>
                    {lead.subscriber.prenom} {lead.subscriber.nom?.toUpperCase()}
                  </span>
                </div>
              </TableCell>

              {/* Date de naissance */}
              <TableCell>{lead.subscriber.dateNaissance || "-"}</TableCell>

              {/* Code postal */}
              <TableCell>{lead.subscriber.codePostal || "-"}</TableCell>

              {/* Profession */}
              <TableCell>
                <span className="text-[var(--color-text-secondary)] text-sm">
                  {lead.subscriber.profession || "-"}
                </span>
              </TableCell>

              {/* Composition (conjoint + enfants) */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.project?.conjoint?.dateNaissance && (
                    <span
                      className="inline-flex items-center gap-1 text-xs bg-[var(--color-surface-elevated)] px-2 py-0.5 rounded"
                      title="Avec conjoint"
                    >
                      <Users className="h-3 w-3" />
                      Conjoint
                    </span>
                  )}
                  {lead.children && lead.children.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-xs bg-[var(--color-surface-elevated)] px-2 py-0.5 rounded"
                      title={`${lead.children.length} enfant(s)`}
                    >
                      <Baby className="h-3 w-3" />
                      {lead.children.length}
                    </span>
                  )}
                  {!lead.project?.conjoint?.dateNaissance &&
                    (!lead.children || lead.children.length === 0) && (
                      <span className="text-[var(--color-text-muted)] text-sm">Solo</span>
                    )}
                </div>
              </TableCell>

              {/* Date d'effet */}
              <TableCell>{lead.project?.dateEffet || "-"}</TableCell>

              {/* Créé le */}
              <TableCell className="text-[var(--color-text-muted)]">
                {formatDate(row.createdAt)}
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(lead)}
                    title="Voir"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lead)}
                    title="Modifier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(row.id)}
                    title="Supprimer"
                    className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
