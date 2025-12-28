import { FileText } from "lucide-react";
import { EmptyState } from "@/renderer/components/ui/EmptyState";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import type { DevisWithLead } from "@/shared/ipc/contracts";
import { DevisCard } from "./DevisCard";

interface DevisGridProps {
  devis: DevisWithLead[];
  loading?: boolean;
  onView: (devis: DevisWithLead) => void;
  onExportPdf: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMarkExpired: (id: string) => void;
  onDelete: (devis: DevisWithLead) => void;
  onGenerate?: () => void;
}

/**
 * Loading skeleton for devis grid
 */
function DevisGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Grid of devis cards
 */
export function DevisGrid({
  devis,
  loading,
  onView,
  onExportPdf,
  onDuplicate,
  onMarkExpired,
  onDelete,
  onGenerate,
}: DevisGridProps) {
  if (loading) {
    return <DevisGridSkeleton />;
  }

  if (devis.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Aucun devis pour ce lead"
        description="Les devis seront générés automatiquement lors de l'exécution des flows d'automation."
        action={
          onGenerate
            ? {
                label: "Générer un devis",
                onClick: onGenerate,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {devis.map((item) => (
        <DevisCard
          key={item.id}
          devis={item}
          onView={onView}
          onExportPdf={onExportPdf}
          onDuplicate={onDuplicate}
          onMarkExpired={onMarkExpired}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
