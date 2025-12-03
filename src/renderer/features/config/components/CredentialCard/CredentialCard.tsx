import { ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/renderer/components/ui/Card";
import type { CredentialCardProps } from "./types";
import { PLATFORM_CONFIG } from "./constants";
import { useCredentialCard } from "./useCredentialCard";
import { LoadingState, EditForm, ViewMode } from "./views";

export function CredentialCard({
  platform,
  state,
  onSave,
  onDelete,
  onTest,
  onResetTest,
}: CredentialCardProps) {
  const config = PLATFORM_CONFIG[platform];

  const {
    isEditing,
    setIsEditing,
    showPassword,
    setShowPassword,
    formData,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isConfigured,
    loading,
    saving,
    testStatus,
    testError,
    handleSave,
    handleCancel,
    handleDelete,
    handleTest,
    updateFormData,
  } = useCredentialCard({ state, onSave, onDelete, onTest, onResetTest });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "border-[var(--color-border)]",
        isConfigured && !isEditing && config.accentBorder
      )}
    >
      {/* Accent stripe */}
      <div
        className={cn(
          "absolute top-0 left-0 w-1 h-full transition-all duration-300",
          isConfigured ? config.accentBg.replace("/10", "/60") : "bg-zinc-600/40"
        )}
      />

      <div className="p-6 pl-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            {/* Platform Icon */}
            <div
              className={cn(
                "flex items-center justify-center h-12 w-12 rounded-xl text-2xl",
                "bg-[var(--color-surface)] border border-[var(--color-border)]",
                "shadow-sm"
              )}
            >
              {config.icon}
            </div>

            {/* Platform Info */}
            <div>
              <h3 className="font-semibold text-lg text-[var(--color-text-primary)] tracking-tight">
                {config.name}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">{config.description}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
              "border transition-all duration-300",
              isConfigured
                ? `${config.accentBg} ${config.accentColor} ${config.accentBorder}`
                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            )}
          >
            {isConfigured ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Configuré
              </>
            ) : (
              <>
                <ShieldX className="h-3.5 w-3.5" />
                Non configuré
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <EditForm
            formData={formData}
            updateFormData={updateFormData}
            saving={saving}
            isConfigured={isConfigured}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />
        ) : (
          <ViewMode
            login={state.info?.login || ""}
            testStatus={testStatus}
            testError={testError}
            saving={saving}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            handleDelete={handleDelete}
            handleTest={handleTest}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    </Card>
  );
}
