import { Plus, X, Users } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";
import { Card } from "@/renderer/components/ui/Card";
import { DateInput } from "@/renderer/components/ui/Input";
import { Select } from "@/renderer/components/ui/Select";
import { PROFESSION_OPTIONS, REGIME_SOCIAL_OPTIONS } from "../constants";
import type { FormData, FormErrors } from "../types";

interface ConjointSectionProps {
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  addConjoint: () => void;
  removeConjoint: () => void;
}

export function ConjointSection({
  formData,
  errors,
  updateField,
  addConjoint,
  removeConjoint,
}: ConjointSectionProps) {
  if (!formData.hasConjoint) {
    return (
      <Button type="button" variant="secondary" onClick={addConjoint} className="w-full">
        <Plus className="h-4 w-4" />
        Ajouter un conjoint
      </Button>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">Conjoint</h3>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={removeConjoint}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date de naissance */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Date de naissance <span className="text-[var(--color-error)]">*</span>
          </label>
          <DateInput
            value={formData.conjointDateNaissance}
            onChange={(value) => updateField("conjointDateNaissance", value)}
            error={errors.conjointDateNaissance}
          />
        </div>

        {/* Profession */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Profession
          </label>
          <Select
            options={PROFESSION_OPTIONS}
            value={formData.conjointProfession}
            onChange={(e) => updateField("conjointProfession", e.target.value)}
          />
        </div>

        {/* Régime social */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Régime social
          </label>
          <Select
            options={REGIME_SOCIAL_OPTIONS}
            value={formData.conjointRegimeSocial}
            onChange={(e) => updateField("conjointRegimeSocial", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
