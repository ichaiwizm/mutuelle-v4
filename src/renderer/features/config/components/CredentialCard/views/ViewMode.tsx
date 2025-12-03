import { Loader2, ShieldCheck, ShieldX, Trash2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/renderer/components/ui/Button";

interface ViewModeProps {
  login: string;
  testStatus: "idle" | "testing" | "success" | "error";
  testError?: string;
  saving: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleDelete: () => void;
  handleTest: () => void;
  setIsEditing: (editing: boolean) => void;
}

export function ViewMode({
  login,
  testStatus,
  testError,
  saving,
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDelete,
  handleTest,
  setIsEditing,
}: ViewModeProps) {
  return (
    <div className="space-y-4">
      {/* Credential Info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex-1">
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Identifiant</div>
          <div className="font-mono text-sm text-[var(--color-text-primary)]">{login}</div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Mot de passe</div>
          <div className="font-mono text-sm text-[var(--color-text-muted)]">••••••••</div>
        </div>
      </div>

      {/* Test Status */}
      {testStatus !== "idle" && (
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border",
            testStatus === "testing" && "bg-blue-500/10 border-blue-500/30 text-blue-400",
            testStatus === "success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
            testStatus === "error" && "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          {testStatus === "testing" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Test de connexion en cours...</span>
            </>
          )}
          {testStatus === "success" && (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm">Connexion réussie</span>
            </>
          )}
          {testStatus === "error" && (
            <>
              <ShieldX className="h-4 w-4" />
              <span className="text-sm">{testError || "Échec de la connexion"}</span>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        {/* Delete */}
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Supprimer ?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={saving}
            >
              Non
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={saving}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Oui, supprimer"}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[var(--color-text-muted)] hover:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        )}

        {/* Edit & Test */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleTest}
            disabled={testStatus === "testing"}
          >
            {testStatus === "testing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Test...
              </>
            ) : (
              <>
                <CircleDot className="h-4 w-4 mr-2" />
                Tester
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
