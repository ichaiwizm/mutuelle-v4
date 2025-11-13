import type { Lead, FormDataInput } from './types.js';
import { BaseTransformer } from './core/BaseTransformer.js';

/**
 * Transforms a Lead object (from email parsing) to FormDataInput (for HTML form)
 *
 * Main transformations:
 * - Dates: DD/MM/YYYY (French) → YYYY-MM-DD (HTML)
 * - Phone: ensure format is maintained
 * - Booleans: convert to boolean type
 * - Numbers: convert to number type
 */
export class LeadToFormDataTransformer extends BaseTransformer<FormDataInput> {
  /**
   * Transform a Lead object to FormDataInput
   */
  transform(lead: Lead): FormDataInput {
    const subscriber = lead.subscriber as any;
    const project = lead.project as any;
    const children = lead.children as any[];

    // Build base form data from subscriber
    const formData: FormDataInput = {
      // Personal information
      civilite: String(subscriber.civilite || ''),
      nom: String(subscriber.nom || ''),
      prenom: String(subscriber.prenom || ''),
      dateNaissance: this.convertDateToHtmlFormat(String(subscriber.dateNaissance || '')),
      email: String(subscriber.email || ''),
      telephone: this.formatPhone(String(subscriber.telephone || '')),

      // Address
      adresse: String(subscriber.adresse || ''),
      codePostal: String(subscriber.codePostal || ''),
      ville: String(subscriber.ville || ''),

      // Professional
      profession: String(subscriber.profession || ''),
      regimeSocial: String(subscriber.regimeSocial || ''),

      // Family
      nombreEnfants: Number(subscriber.nombreEnfants || children?.length || 0),

      // Project/Coverage - with defaults
      dateEffet: project?.dateEffet ? this.convertDateToHtmlFormat(String(project.dateEffet)) : this.getDefaultDateEffet(30),
      actuellementAssure: Boolean(project?.actuellementAssure),
      soinsMedicaux: Number(project?.soinsMedicaux || 2),
      hospitalisation: Number(project?.hospitalisation || 2),
      optique: Number(project?.optique || 2),
      dentaire: Number(project?.dentaire || 2),
    };

    // Add conjoint if present
    if (project?.conjoint) {
      formData.hasConjoint = true;
      formData.conjoint_dateNaissance = this.convertDateToHtmlFormat(String(project.conjoint.dateNaissance || ''));
      formData.conjoint_profession = String(project.conjoint.profession || '');
      formData.conjoint_regimeSocial = String(project.conjoint.regimeSocial || '');
    }

    // Add children if present
    if (children && children.length > 0) {
      formData.children = children.map((child, index) => ({
        dateNaissance: this.convertDateToHtmlFormat(String(child.dateNaissance || '')),
        order: child.order || index + 1,
      }));
    }

    return formData;
  }

  /**
   * Convert HTML date format (YYYY-MM-DD) to French format (DD/MM/YYYY)
   * This is the reverse transformation (used for testing)
   */
  public convertDateToFrench(htmlDate: string): string {
    if (!htmlDate || !htmlDate.includes('-')) {
      return '';
    }

    const [year, month, day] = htmlDate.split('-');
    return `${day}/${month}/${year}`;
  }

  /**
   * Validate form data
   */
  validate(formData: FormDataInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!formData.civilite) errors.push('Civilité requise');
    if (!formData.nom) errors.push('Nom requis');
    if (!formData.prenom) errors.push('Prénom requis');
    if (!formData.dateNaissance) errors.push('Date de naissance requise');
    if (!formData.email) errors.push('Email requis');
    if (!formData.telephone) errors.push('Téléphone requis');
    if (!formData.adresse) errors.push('Adresse requise');
    if (!formData.codePostal) errors.push('Code postal requis');
    if (!formData.ville) errors.push('Ville requise');
    if (!formData.profession) errors.push('Profession requise');
    if (!formData.regimeSocial) errors.push('Régime social requis');
    if (!formData.dateEffet) errors.push('Date d\'effet requise');

    // Validate email format
    if (formData.email && !formData.email.includes('@')) {
      errors.push('Format email invalide');
    }

    // Validate phone format
    if (formData.telephone && !formData.telephone.match(/^\d{2}\.\d{2}\.\d{2}\.\d{2}\.\d{2}$/)) {
      errors.push('Format téléphone invalide (attendu: XX.XX.XX.XX.XX)');
    }

    // Validate code postal
    if (formData.codePostal && !formData.codePostal.match(/^\d{5}$/)) {
      errors.push('Code postal invalide (5 chiffres requis)');
    }

    // Validate coverage levels
    const coverageFields = ['soinsMedicaux', 'hospitalisation', 'optique', 'dentaire'];
    for (const field of coverageFields) {
      const value = formData[field as keyof FormDataInput] as number;
      if (value < 1 || value > 4) {
        errors.push(`${field}: valeur doit être entre 1 et 4`);
      }
    }

    // Validate conjoint if present
    if (formData.hasConjoint) {
      if (!formData.conjoint_dateNaissance) errors.push('Date de naissance du conjoint requise');
      if (!formData.conjoint_profession) errors.push('Profession du conjoint requise');
      if (!formData.conjoint_regimeSocial) errors.push('Régime social du conjoint requis');
    }

    // Validate children
    if (formData.nombreEnfants > 0) {
      if (!formData.children || formData.children.length !== formData.nombreEnfants) {
        errors.push(`Nombre d'enfants incorrect: ${formData.nombreEnfants} attendu(s), ${formData.children?.length || 0} fourni(s)`);
      }

      if (formData.children) {
        formData.children.forEach((child, index) => {
          if (!child.dateNaissance) {
            errors.push(`Date de naissance de l'enfant ${index + 1} requise`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Helper function to create transformer instance
 */
export function createTransformer(): LeadToFormDataTransformer {
  return new LeadToFormDataTransformer();
}
