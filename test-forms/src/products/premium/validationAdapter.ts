import { PremiumFormData, ValidationResult, AdaptationResult } from './types.js';

export interface ValidationRule {
  field: keyof PremiumFormData;
  validate: (value: any, formData: PremiumFormData) => boolean;
  adapt: (value: any, formData: PremiumFormData) => any;
  message: string;
}

/**
 * Adaptateur de validation qui ajuste automatiquement les données
 * pour respecter les contraintes strictes du produit Premium
 */
export class ValidationAdapter {
  private rules: ValidationRule[] = [
    // Date d'effet : minimum +7 jours dans le futur
    // Règle métier : La compagnie d'assurance a besoin d'au moins 7 jours
    // pour traiter la demande, effectuer les vérifications nécessaires,
    // et activer la couverture. Cette période permet également au client
    // de compléter son dossier et fournir les documents requis.
    {
      field: 'dateEffet',
      validate: (value: string) => {
        if (!value) return false;

        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 7);

        return date >= minDate;
      },
      adapt: (value: string) => {
        const date = new Date(value);
        date.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 7);

        if (date < minDate) {
          // Ajuster à J+7
          const year = minDate.getFullYear();
          const month = String(minDate.getMonth() + 1).padStart(2, '0');
          const day = String(minDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        return value;
      },
      message: 'Date d\'effet ajustée à J+7 minimum'
    },

    // Date de naissance : minimum 18 ans
    // Règle métier : Le produit Premium est réservé aux adultes majeurs.
    // Les personnes de moins de 18 ans doivent être couvertes en tant
    // qu'enfants d'un souscripteur adulte. Cette règle est liée aux
    // obligations légales de souscription d'un contrat d'assurance.
    {
      field: 'dateNaissance',
      validate: (value: string) => {
        if (!value) return false;

        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

        return actualAge >= 18;
      },
      adapt: (value: string) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 18) {
          // Ajuster à il y a 18 ans
          const adjustedDate = new Date(today);
          adjustedDate.setFullYear(adjustedDate.getFullYear() - 18);

          const year = adjustedDate.getFullYear();
          const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
          const day = String(adjustedDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        return value;
      },
      message: 'Date de naissance ajustée pour respecter l\'âge minimum de 18 ans'
    },

    // Téléphone : format strict 06/07.XX.XX.XX.XX
    // Règle métier : Pour le produit Premium, seuls les numéros mobiles
    // français sont acceptés (06 ou 07). Cette exigence permet d'assurer
    // une communication rapide avec le client (SMS, validation 2FA) et
    // garantit la joignabilité pour les urgences médicales. Les numéros
    // fixes ne sont pas acceptés car moins fiables pour les notifications.
    {
      field: 'telephone',
      validate: (value: string) => {
        return /^(06|07)\.\d{2}\.\d{2}\.\d{2}\.\d{2}$/.test(value);
      },
      adapt: (value: string) => {
        // Nettoyer et reformater
        const digits = value.replace(/\D/g, '');

        if (digits.length !== 10) {
          // Ne peut pas adapter si pas 10 chiffres
          return value;
        }

        // Vérifier que ça commence par 06 ou 07
        if (!digits.startsWith('06') && !digits.startsWith('07')) {
          // Forcer 06
          const adjusted = '06' + digits.slice(2);
          return adjusted.match(/.{1,2}/g)!.join('.');
        }

        return digits.match(/.{1,2}/g)!.join('.');
      },
      message: 'Téléphone ajusté au format 06/07.XX.XX.XX.XX'
    },

    // Code postal : 5 chiffres
    // Règle métier : Le code postal français doit toujours contenir
    // exactement 5 chiffres. Cette information est cruciale pour
    // déterminer le réseau de soins disponible (hôpitaux, médecins
    // conventionnés) et calculer les tarifs régionaux applicables.
    {
      field: 'codePostal',
      validate: (value: string) => {
        return /^\d{5}$/.test(value);
      },
      adapt: (value: string) => {
        const digits = value.replace(/\D/g, '');

        if (digits.length === 5) {
          return digits;
        }

        if (digits.length < 5) {
          return digits.padStart(5, '0');
        }

        return digits.slice(0, 5);
      },
      message: 'Code postal formaté à 5 chiffres'
    },
  ];

  /**
   * Adapte les données pour respecter les validations
   * Retourne les données adaptées et les warnings
   */
  adapt(formData: PremiumFormData): AdaptationResult<PremiumFormData> {
    const adapted = { ...formData };
    const warnings: string[] = [];

    for (const rule of this.rules) {
      const value = adapted[rule.field];

      if (value !== undefined && value !== null && value !== '') {
        if (!rule.validate(value, adapted)) {
          const adaptedValue = rule.adapt(value, adapted);

          if (adaptedValue !== value) {
            (adapted as any)[rule.field] = adaptedValue;
            warnings.push(`${String(rule.field)}: ${rule.message}`);
          }
        }
      }
    }

    return { adapted, warnings };
  }

  /**
   * Valide les données sans les adapter
   * Retourne les erreurs de validation
   */
  validate(formData: PremiumFormData): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of this.rules) {
      const value = formData[rule.field];

      if (value !== undefined && value !== null && value !== '') {
        if (!rule.validate(value, formData)) {
          errors.push({
            field: String(rule.field),
            message: rule.message
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Ajoute une règle de validation personnalisée
   */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Retourne toutes les règles de validation
   */
  getRules(): ValidationRule[] {
    return [...this.rules];
  }
}
