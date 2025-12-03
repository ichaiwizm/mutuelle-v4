import { FileText } from "lucide-react";
import { Card } from "@/renderer/components/ui/Card";
import { DateInput } from "@/renderer/components/ui/Input";
import type { FormData, FormErrors } from "../types";

interface ProjectSectionProps {
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function ProjectSection({ formData, errors, updateField }: ProjectSectionProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-[var(--color-primary)]" />
        <h3 className="font-semibold text-[var(--color-text-primary)]">Projet</h3>
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          Date d'effet <span className="text-[var(--color-error)]">*</span>
        </label>
        <DateInput
          value={formData.dateEffet}
          onChange={(value) => updateField("dateEffet", value)}
          error={errors.dateEffet}
        />
      </div>
    </Card>
  );
}
