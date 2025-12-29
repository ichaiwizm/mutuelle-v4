import { Eye, EyeOff, Loader2, Check, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/renderer/components/ui/Input";
import { Button } from "@/renderer/components/ui/Button";
import type { Platform, CredentialFormData } from "../../../hooks/useCredentials";

interface EditFormProps {
  platform: Platform;
  formData: CredentialFormData;
  updateFormData: (field: keyof CredentialFormData, value: string) => void;
  saving: boolean;
  isConfigured: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

export function EditForm({
  platform,
  formData,
  updateFormData,
  saving,
  isConfigured,
  showPassword,
  setShowPassword,
  handleSave,
  handleCancel,
}: EditFormProps) {
  const isEntoria = platform === "entoria";
  const isSaveDisabled =
    saving ||
    !formData.login.trim() ||
    !formData.password.trim() ||
    (isEntoria && !formData.courtierCode?.trim());

  return (
    <div className="space-y-4">
      {/* Code Courtier Field - Only for Entoria */}
      {isEntoria && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Code Courtier
          </label>
          <Input
            type="text"
            placeholder="Votre code courtier"
            value={formData.courtierCode || ""}
            onChange={(e) => updateFormData("courtierCode", e.target.value)}
            disabled={saving}
            className="bg-[var(--color-surface)]"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Login Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Identifiant
          </label>
          <Input
            type="text"
            placeholder="Votre identifiant"
            value={formData.login}
            onChange={(e) => updateFormData("login", e.target.value)}
            disabled={saving}
            className="bg-[var(--color-surface)]"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Mot de passe
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={isConfigured ? "••••••••" : "Votre mot de passe"}
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              disabled={saving}
              className="bg-[var(--color-surface)] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                "transition-colors"
              )}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <KeyRound className="h-3.5 w-3.5" />
          Chiffrement AES-256
        </div>
        <div className="flex items-center gap-2">
          {isConfigured && (
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              Annuler
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
