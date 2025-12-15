import { UserPlus, RefreshCw, Sparkles } from "lucide-react";
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

        {/* Bouton manuel - secondaire */}
        <Button variant="secondary" onClick={onCreate}>
          <UserPlus className="h-4 w-4" />
          Créer manuellement
        </Button>

        {/* Bouton import intelligent - primary avec indicateur visuel */}
        <Button
          onClick={onImport}
          className="relative group"
          title="Collez un email et le lead sera automatiquement extrait"
        >
          <Sparkles className="h-4 w-4" />
          Importer un email
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary-hover)] opacity-50"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-primary)] border-2 border-[var(--color-background)]"></span>
          </span>
        </Button>
      </div>
    </div>
  );
}
