import { Button } from "@/renderer/components/ui/Button";
import type { LeadFormProps } from "./types";
import { useLeadForm } from "./useLeadForm";
import {
  SubscriberSection,
  ProjectSection,
  ConjointSection,
  ChildrenSection,
} from "./sections";

export function LeadForm({ lead, onSubmit, onCancel, isSubmitting = false }: LeadFormProps) {
  const {
    formData,
    errors,
    isEditing,
    updateField,
    addConjoint,
    removeConjoint,
    addChild,
    removeChild,
    updateChildDate,
    handleSubmit,
  } = useLeadForm({ lead, onSubmit });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Adhérent Section */}
      <SubscriberSection formData={formData} errors={errors} updateField={updateField} />

      {/* Projet Section */}
      <ProjectSection formData={formData} errors={errors} updateField={updateField} />

      {/* Conjoint Section */}
      <ConjointSection
        formData={formData}
        errors={errors}
        updateField={updateField}
        addConjoint={addConjoint}
        removeConjoint={removeConjoint}
      />

      {/* Enfants Section */}
      <ChildrenSection
        formData={formData}
        errors={errors}
        addChild={addChild}
        removeChild={removeChild}
        updateChildDate={updateChildDate}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le lead"}
        </Button>
      </div>
    </form>
  );
}
