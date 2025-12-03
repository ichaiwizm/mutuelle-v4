import { useState, useCallback, useEffect } from "react";
import type { PlatformState, CredentialFormData } from "../../hooks/useCredentials";

interface UseCredentialCardOptions {
  state: PlatformState;
  onSave: (data: CredentialFormData) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onTest: () => Promise<any>;
  onResetTest: () => void;
}

export function useCredentialCard({
  state,
  onSave,
  onDelete,
  onTest,
  onResetTest,
}: UseCredentialCardOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CredentialFormData>({ login: "", password: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isConfigured = !!state.info?.hasPassword;
  const { loading, saving, testStatus, testError } = state;

  // Reset form when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setFormData({ login: state.info?.login || "", password: "" });
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
    const success = await onSave(formData);
    if (success) {
      setIsEditing(false);
      setFormData({ login: "", password: "" });
    }
  }, [formData, onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData({ login: state.info?.login || "", password: "" });
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
