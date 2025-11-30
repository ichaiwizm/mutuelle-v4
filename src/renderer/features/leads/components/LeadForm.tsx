import { useState, useCallback } from "react";
import { Button } from "@/renderer/components/ui/Button";
import { Input, DateInput } from "@/renderer/components/ui/Input";
import { Select } from "@/renderer/components/ui/Select";
import { Card } from "@/renderer/components/ui/Card";
import { Plus, X, User, FileText, Users, Baby } from "lucide-react";
import type { Lead, Child, Conjoint } from "@/shared/types/lead";

/**
 * Profession options aligned with Alptis mapper
 */
const PROFESSION_OPTIONS = [
  { value: "", label: "Sélectionner..." },
  { value: "profession libérale", label: "Profession libérale" },
  { value: "chef d'entreprise", label: "Chef d'entreprise" },
  { value: "commerçant", label: "Commerçant" },
  { value: "artisan", label: "Artisan" },
  { value: "salarié", label: "Salarié" },
  { value: "cadre", label: "Cadre" },
  { value: "ouvrier", label: "Ouvrier" },
  { value: "retraité", label: "Retraité" },
  { value: "fonction publique", label: "Fonction publique" },
  { value: "exploitant agricole", label: "Exploitant agricole" },
  { value: "en recherche d'emploi", label: "En recherche d'emploi" },
  { value: "sans activité", label: "Sans activité" },
  { value: "autre", label: "Autre" },
];

/**
 * Régime social options aligned with Alptis mapper
 */
const REGIME_SOCIAL_OPTIONS = [
  { value: "", label: "Sélectionner..." },
  { value: "salarié", label: "Salarié" },
  { value: "salarié (ou retraité)", label: "Retraité (ex-salarié)" },
  { value: "tns : régime des indépendants", label: "TNS (Indépendant)" },
  { value: "alsace", label: "Alsace-Moselle" },
  { value: "exploitant agricole", label: "Exploitant agricole (MSA)" },
  { value: "amexa", label: "AMEXA" },
  { value: "autre", label: "Autre" },
];

/**
 * Civilité options
 */
const CIVILITE_OPTIONS = [
  { value: "", label: "Sélectionner..." },
  { value: "M", label: "Monsieur" },
  { value: "Mme", label: "Madame" },
];

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (lead: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  // Subscriber
  civilite: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  codePostal: string;
  profession: string;
  regimeSocial: string;
  // Project
  dateEffet: string;
  // Conjoint (optional)
  hasConjoint: boolean;
  conjointDateNaissance: string;
  conjointProfession: string;
  conjointRegimeSocial: string;
  // Children
  children: { dateNaissance: string }[];
}

interface FormErrors {
  civilite?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  codePostal?: string;
  profession?: string;
  regimeSocial?: string;
  dateEffet?: string;
  conjointDateNaissance?: string;
  children?: { dateNaissance?: string }[];
}

const DATE_PATTERN = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const CODE_POSTAL_PATTERN = /^\d{5}$/;

/**
 * Normalize profession value to match dropdown options
 */
function normalizeProfession(value?: string): string {
  if (!value) return "";
  const lower = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const mapping: Record<string, string> = {
    "profession liberale": "profession libérale",
    "chef d'entreprise": "chef d'entreprise",
    "commercant": "commerçant",
    "artisan": "artisan",
    "salarie": "salarié",
    "cadre": "cadre",
    "ouvrier": "ouvrier",
    "retraite": "retraité",
    "fonction publique": "fonction publique",
    "fonctionnaire": "fonction publique",
    "exploitant agricole": "exploitant agricole",
    "agriculteur": "exploitant agricole",
    "en recherche d'emploi": "en recherche d'emploi",
    "chomeur": "en recherche d'emploi",
    "sans activite": "sans activité",
  };

  // Find matching key
  for (const [key, val] of Object.entries(mapping)) {
    if (lower.includes(key)) return val;
  }

  // If no match found but value exists, return "autre"
  return value ? "autre" : "";
}

/**
 * Normalize regime social value to match dropdown options
 */
function normalizeRegimeSocial(value?: string): string {
  if (!value) return "";
  const lower = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (lower.includes("tns") || lower.includes("independant") || lower.includes("travailleur")) {
    return "tns : régime des indépendants";
  }
  if (lower.includes("retraite")) {
    return "salarié (ou retraité)";
  }
  if (lower.includes("general") || lower.includes("salari")) {
    return "salarié";
  }
  if (lower.includes("alsace") || lower.includes("moselle")) {
    return "alsace";
  }
  if (lower.includes("agricole") || lower.includes("msa")) {
    return "exploitant agricole";
  }
  if (lower.includes("amexa")) {
    return "amexa";
  }

  // If no match found but value exists, return "autre"
  return value ? "autre" : "";
}

/**
 * Simplified Lead Form Component
 */
export function LeadForm({ lead, onSubmit, onCancel, isSubmitting = false }: LeadFormProps) {
  const isEditing = !!lead;

  // Initialize form data
  const [formData, setFormData] = useState<FormData>(() => {
    if (lead) {
      return {
        civilite: lead.subscriber.civilite || "",
        nom: lead.subscriber.nom || "",
        prenom: lead.subscriber.prenom || "",
        dateNaissance: lead.subscriber.dateNaissance || "",
        codePostal: lead.subscriber.codePostal || "",
        profession: normalizeProfession(lead.subscriber.profession),
        regimeSocial: normalizeRegimeSocial(lead.subscriber.regimeSocial),
        dateEffet: lead.project?.dateEffet || "",
        hasConjoint: !!lead.project?.conjoint?.dateNaissance,
        conjointDateNaissance: lead.project?.conjoint?.dateNaissance || "",
        conjointProfession: normalizeProfession(lead.project?.conjoint?.profession),
        conjointRegimeSocial: normalizeRegimeSocial(lead.project?.conjoint?.regimeSocial),
        children: lead.children?.map((c) => ({ dateNaissance: c.dateNaissance || "" })) || [],
      };
    }
    return {
      civilite: "",
      nom: "",
      prenom: "",
      dateNaissance: "",
      codePostal: "",
      profession: "",
      regimeSocial: "",
      dateEffet: "",
      hasConjoint: false,
      conjointDateNaissance: "",
      conjointProfession: "",
      conjointRegimeSocial: "",
      children: [],
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Update form field
   */
  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  /**
   * Add conjoint
   */
  const addConjoint = useCallback(() => {
    updateField("hasConjoint", true);
  }, [updateField]);

  /**
   * Remove conjoint
   */
  const removeConjoint = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      hasConjoint: false,
      conjointDateNaissance: "",
      conjointProfession: "",
      conjointRegimeSocial: "",
    }));
  }, []);

  /**
   * Add child
   */
  const addChild = useCallback(() => {
    if (formData.children.length >= 10) return;
    setFormData((prev) => ({
      ...prev,
      children: [...prev.children, { dateNaissance: "" }],
    }));
  }, [formData.children.length]);

  /**
   * Remove child
   */
  const removeChild = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  }, []);

  /**
   * Update child date
   */
  const updateChildDate = useCallback((index: number, dateNaissance: string) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, dateNaissance } : child
      ),
    }));
  }, []);

  /**
   * Validate form
   */
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.civilite) newErrors.civilite = "Requis";
    if (!formData.nom || formData.nom.length < 2) newErrors.nom = "Min 2 caractères";
    if (!formData.prenom || formData.prenom.length < 2) newErrors.prenom = "Min 2 caractères";
    if (!formData.dateNaissance || !DATE_PATTERN.test(formData.dateNaissance)) {
      newErrors.dateNaissance = "Format: JJ/MM/AAAA";
    }
    if (!formData.codePostal || !CODE_POSTAL_PATTERN.test(formData.codePostal)) {
      newErrors.codePostal = "5 chiffres";
    }
    if (!formData.profession) newErrors.profession = "Requis";
    if (!formData.regimeSocial) newErrors.regimeSocial = "Requis";
    if (!formData.dateEffet || !DATE_PATTERN.test(formData.dateEffet)) {
      newErrors.dateEffet = "Format: JJ/MM/AAAA";
    }

    // Conjoint validation
    if (formData.hasConjoint) {
      if (!formData.conjointDateNaissance || !DATE_PATTERN.test(formData.conjointDateNaissance)) {
        newErrors.conjointDateNaissance = "Format: JJ/MM/AAAA";
      }
    }

    // Children validation
    const childrenErrors: { dateNaissance?: string }[] = [];
    formData.children.forEach((child, index) => {
      if (!child.dateNaissance || !DATE_PATTERN.test(child.dateNaissance)) {
        childrenErrors[index] = { dateNaissance: "Format: JJ/MM/AAAA" };
      }
    });
    if (childrenErrors.length > 0) {
      newErrors.children = childrenErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle submit
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      // Build lead object
      const leadData: Partial<Lead> = {
        ...(lead?.id && { id: lead.id }),
        subscriber: {
          civilite: formData.civilite,
          nom: formData.nom,
          prenom: formData.prenom,
          dateNaissance: formData.dateNaissance,
          codePostal: formData.codePostal,
          profession: formData.profession,
          regimeSocial: formData.regimeSocial,
        },
        project: {
          dateEffet: formData.dateEffet,
          source: isEditing ? lead?.project?.source : "manual",
          ...(formData.hasConjoint && {
            conjoint: {
              dateNaissance: formData.conjointDateNaissance,
              ...(formData.conjointProfession && { profession: formData.conjointProfession }),
              ...(formData.conjointRegimeSocial && { regimeSocial: formData.conjointRegimeSocial }),
            } as Conjoint,
          }),
        },
        ...(formData.children.length > 0 && {
          children: formData.children.map((c, i) => ({
            dateNaissance: c.dateNaissance,
            order: i + 1,
          })) as Child[],
        }),
      };

      await onSubmit(leadData);
    },
    [formData, validate, onSubmit, isEditing, lead]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Adhérent Section */}
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

      {/* Projet Section */}
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

      {/* Conjoint Section */}
      {!formData.hasConjoint ? (
        <Button type="button" variant="secondary" onClick={addConjoint} className="w-full">
          <Plus className="h-4 w-4" />
          Ajouter un conjoint
        </Button>
      ) : (
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
      )}

      {/* Enfants Section */}
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

      {formData.children.length < 10 && (
        <Button type="button" variant="secondary" onClick={addChild} className="w-full">
          <Plus className="h-4 w-4" />
          Ajouter un enfant
        </Button>
      )}

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
