import { StatusBadge, type StatusVariant } from "../common/StatusBadge";
import type { Run } from "@/shared/types/run";

type RunRowProps = {
  run: Run;
};

export function RunRow({ run }: RunRowProps) {
  const variant = getStatusVariant(run.status);

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground truncate max-w-[120px]">
        #{run.id.slice(0, 8)}
      </span>
      <StatusBadge variant={variant} dot>
        {getStatusLabel(run.status)}
      </StatusBadge>
    </div>
  );
}

function getStatusVariant(status: Run["status"]): StatusVariant {
  const map: Record<Run["status"], StatusVariant> = {
    queued: "queued",
    running: "running",
    done: "success",
    failed: "error",
    cancelled: "neutral",
  };
  return map[status];
}

function getStatusLabel(status: Run["status"]): string {
  const map: Record<Run["status"], string> = {
    queued: "En attente",
    running: "En cours",
    done: "Terminé",
    failed: "Échoué",
    cancelled: "Annulé",
  };
  return map[status];
}
