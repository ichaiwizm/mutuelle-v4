import { Plus, X, Baby } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";
import { Card } from "@/renderer/components/ui/Card";
import { DateInput } from "@/renderer/components/ui/Input";
import type { FormData, FormErrors } from "../types";

interface ChildrenSectionProps {
  formData: FormData;
  errors: FormErrors;
  addChild: () => void;
  removeChild: (index: number) => void;
  updateChildDate: (index: number, dateNaissance: string) => void;
}

export function ChildrenSection({
  formData,
  errors,
  addChild,
  removeChild,
  updateChildDate,
}: ChildrenSectionProps) {
  return (
    <>
      {/* Children List */}
      {formData.children.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Baby className="h-5 w-5 text-[var(--color-primary)]" />
            <h3 className="font-semibold text-[var(--color-text-primary)]">Enfants</h3>
          </div>

          <div className="space-y-3">
            {formData.children.map((child, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Enfant {index + 1} - Date de naissance{" "}
                    <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <DateInput
                    value={child.dateNaissance}
                    onChange={(value) => updateChildDate(index, value)}
                    error={errors.children?.[index]?.dateNaissance}
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeChild(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Child Button */}
      {formData.children.length < 10 && (
        <Button type="button" variant="secondary" onClick={addChild} className="w-full">
          <Plus className="h-4 w-4" />
          Ajouter un enfant
        </Button>
      )}
    </>
  );
}
