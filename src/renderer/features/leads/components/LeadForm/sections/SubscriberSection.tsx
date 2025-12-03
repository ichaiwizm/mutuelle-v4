import { User } from "lucide-react";
import { Card } from "@/renderer/components/ui/Card";
import { Input, DateInput } from "@/renderer/components/ui/Input";
import { Select } from "@/renderer/components/ui/Select";
import { CIVILITE_OPTIONS, PROFESSION_OPTIONS, REGIME_SOCIAL_OPTIONS } from "../constants";
import type { FormData, FormErrors } from "../types";

interface SubscriberSectionProps {
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function SubscriberSection({ formData, errors, updateField }: SubscriberSectionProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-[var(--color-primary)]" />
        <h3 className="font-semibold text-[var(--color-text-primary)]">Adhérent</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Civilité */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Civilité <span className="text-[var(--color-error)]">*</span>
          </label>
          <Select
            options={CIVILITE_OPTIONS}
            value={formData.civilite}
            onChange={(e) => updateField("civilite", e.target.value)}
            error={errors.civilite}
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Nom <span className="text-[var(--color-error)]">*</span>
          </label>
          <Input
            value={formData.nom}
            onChange={(e) => updateField("nom", e.target.value)}
            placeholder="Dupont"
            error={errors.nom}
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Prénom <span className="text-[var(--color-error)]">*</span>
          </label>
          <Input
            value={formData.prenom}
            onChange={(e) => updateField("prenom", e.target.value)}
            placeholder="Jean"
            error={errors.prenom}
          />
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Date de naissance <span className="text-[var(--color-error)]">*</span>
          </label>
          <DateInput
            value={formData.dateNaissance}
            onChange={(value) => updateField("dateNaissance", value)}
            error={errors.dateNaissance}
          />
        </div>

        {/* Code postal */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Code postal <span className="text-[var(--color-error)]">*</span>
          </label>
          <Input
            value={formData.codePostal}
            onChange={(e) => updateField("codePostal", e.target.value)}
            placeholder="75001"
            error={errors.codePostal}
          />
        </div>

        {/* Profession */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Profession <span className="text-[var(--color-error)]">*</span>
          </label>
          <Select
            options={PROFESSION_OPTIONS}
            value={formData.profession}
            onChange={(e) => updateField("profession", e.target.value)}
            error={errors.profession}
          />
        </div>

        {/* Régime social */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Régime social <span className="text-[var(--color-error)]">*</span>
          </label>
          <Select
            options={REGIME_SOCIAL_OPTIONS}
            value={formData.regimeSocial}
            onChange={(e) => updateField("regimeSocial", e.target.value)}
            error={errors.regimeSocial}
          />
        </div>
      </div>
    </Card>
  );
}
