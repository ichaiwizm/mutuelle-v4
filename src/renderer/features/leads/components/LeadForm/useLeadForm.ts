import { useState, useCallback } from "react";
import type { Lead, Child, Conjoint } from "@/shared/types/lead";
import type { FormData, FormErrors } from "./types";
import { DATE_PATTERN, CODE_POSTAL_PATTERN } from "./types";
import { normalizeProfession, normalizeRegimeSocial } from "./normalizers";

interface UseLeadFormOptions {
  lead?: Lead;
  onSubmit: (lead: Partial<Lead>) => Promise<void>;
}

export function useLeadForm({ lead, onSubmit }: UseLeadFormOptions) {
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

  return {
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
  };
}
