import { UserPlus, RefreshCw, ClipboardPaste } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";

interface LeadsHeaderProps {
  total: number;
  loading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
  onImport: () => void;
}

export function LeadsHeader({ total, loading, onRefresh, onCreate, onImport }: LeadsHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] font-display">
          Leads
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {total} lead{total > 1 ? "s" : ""} au total
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          title="Rafraîchir"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button variant="secondary" onClick={onImport}>
          <ClipboardPaste className="h-4 w-4" />
          Importer
        </Button>
        <Button onClick={onCreate}>
          <UserPlus className="h-4 w-4" />
          Nouveau lead
        </Button>
      </div>
    </div>
  );
}
