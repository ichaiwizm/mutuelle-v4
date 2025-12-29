import { useState, useCallback, useEffect } from "react";
import type { Platform, PlatformState, CredentialFormData } from "../../hooks/useCredentials";

interface UseCredentialCardOptions {
  platform: Platform;
  state: PlatformState;
  onSave: (data: CredentialFormData) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onTest: () => Promise<any>;
  onResetTest: () => void;
}

export function useCredentialCard({
  platform,
  state,
  onSave,
  onDelete,
  onTest,
  onResetTest,
}: UseCredentialCardOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CredentialFormData>({ login: "", password: "", courtierCode: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isConfigured = !!state.info?.hasPassword;
  const { loading, saving, testStatus, testError } = state;

  // Reset form when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setFormData({ login: state.info?.login || "", password: "", courtierCode: "" });
      setShowPassword(false);
    }
  }, [isEditing, state.info?.login]);

  // Enter edit mode if no credentials configured
  useEffect(() => {
    if (!loading && !isConfigured && !isEditing) {
      setIsEditing(true);
    }
  }, [loading, isConfigured, isEditing]);

  const handleSave = useCallback(async () => {
    if (!formData.login.trim() || !formData.password.trim()) return;
    // For Entoria, courtierCode is required
    if (platform === 'entoria' && !formData.courtierCode?.trim()) return;
    const success = await onSave(formData);
    if (success) {
      setIsEditing(false);
      setFormData({ login: "", password: "", courtierCode: "" });
    }
  }, [formData, onSave, platform]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData({ login: state.info?.login || "", password: "", courtierCode: "" });
    onResetTest();
  }, [state.info?.login, onResetTest]);

  const handleDelete = useCallback(async () => {
    await onDelete();
    setShowDeleteConfirm(false);
    setIsEditing(true);
  }, [onDelete]);

  const handleTest = useCallback(async () => {
    await onTest();
  }, [onTest]);

  const updateFormData = useCallback((field: keyof CredentialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    // State
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
    // Handlers
    handleSave,
    handleCancel,
    handleDelete,
    handleTest,
    updateFormData,
  };
}
