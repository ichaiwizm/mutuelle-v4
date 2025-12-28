/**
 * Transformateur pour Entoria Pack Famille (TNS Santé)
 * Formulaire de tarification en 4 étapes
 */

import type {
  Lead,
  PackFamilleFormData,
  TransformResult,
  TransformError,
  TransformWarning,
} from './types';

/**
 * Formate une date en DD/MM/YYYY
 */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';

  // Si déjà au format DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Si format ISO ou autre
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Extrait le département du code postal
 */
function getDepartementFromCodePostal(codePostal: string | undefined): string {
  if (!codePostal) return '75'; // Paris par défaut

  // DOM-TOM : 3 premiers chiffres
  if (codePostal.startsWith('97') || codePostal.startsWith('98')) {
    return codePostal.substring(0, 3);
  }

  // France métropolitaine : 2 premiers chiffres
  return codePostal.substring(0, 2);
}

/**
 * Mappe la profession du lead vers une profession Entoria
 */
function mapProfession(profession: string | undefined): string {
  if (!profession) return 'Artisan';

  const lower = profession.toLowerCase();

  if (lower.includes('artisan')) return 'Artisan';
  if (lower.includes('commerçant') || lower.includes('commercant')) return 'Commerçant';
  if (lower.includes('libéral') || lower.includes('liberal')) return 'Profession libérale';
  if (lower.includes('agriculteur')) return 'Agriculteur';
  if (lower.includes('chef') || lower.includes('dirigeant')) return 'Chef d\'entreprise';

  return 'Artisan'; // Défaut
}

/**
 * Calcule la date d'effet (1er du mois suivant)
 */
function getDateEffet(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const day = nextMonth.getDate().toString().padStart(2, '0');
  const month = (nextMonth.getMonth() + 1).toString().padStart(2, '0');
  const year = nextMonth.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Vérifie si une date est valide pour Entoria (>= 1er du mois en cours)
 */
function isValidDateEffet(dateStr: string): boolean {
  // Parser DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const dateEffet = new Date(year, month, day);
  const now = new Date();
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return dateEffet >= firstOfCurrentMonth;
}

export class LeadTransformer {
  /**
   * Transforme un lead AssurProspect en données Entoria Pack Famille
   */
  static transform(lead: Lead): PackFamilleFormData {
    console.log('\n========================================');
    console.log('LEAD TRANSFORMATION START (ENTORIA TNS SANTE)');
    console.log('========================================');
    console.log('Lead ID:', lead.id);

    const subscriber = lead.subscriber;
    const project = lead.project;

    // Étape 1 : Profil
    const profil = {
      date_naissance: formatDate(subscriber.dateNaissance),
      profession: mapProfession(subscriber.profession),
      exerce_en_tant_que: 'GÉRANT MAJORITAIRE', // Valeur par défaut
      departement_residence: getDepartementFromCodePostal(subscriber.codePostal),
      assure_prevoyance_entoria: false,
    };

    // Étape 2 : Besoin
    const besoin = {
      hospitalisation_uniquement: false, // Par défaut, couverture complète
    };

    // Étape 3 : Garanties
    // Utiliser la date d'effet du lead si valide (>= 1er du mois), sinon 1er du mois suivant
    let dateEffet = getDateEffet();
    if (project?.dateEffet) {
      const formattedDate = formatDate(project.dateEffet);
      if (formattedDate && isValidDateEffet(formattedDate)) {
        dateEffet = formattedDate;
      } else {
        console.log(`Date d'effet invalide (${formattedDate}), utilisation du 1er du mois suivant`);
      }
    }

    const garanties = {
      frequence_reglement: 'Mensuelle' as const,
      date_effet: dateEffet,
      avec_conjoint: !!project?.conjoint,
      avec_enfants: (lead.children?.length ?? 0) > 0,
      formule_choisie: 'ESSENTIEL_PRO' as const, // Formule par défaut
    };

    const result: PackFamilleFormData = {
      profil,
      besoin,
      garanties,
    };

    console.log('\n========================================');
    console.log('LEAD TRANSFORMATION COMPLETE');
    console.log('========================================');
    console.log('Final result:', JSON.stringify(result, null, 2));

    return result;
  }

  /**
   * Transforme un lead avec gestion des erreurs
   */
  static transformSafe(lead: Lead): TransformResult {
    const errors: TransformError[] = [];
    const warnings: TransformWarning[] = [];

    try {
      const data = this.transform(lead);
      return {
        success: true,
        data,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      errors.push({
        code: 'TRANSFORM_ERROR',
        message: error instanceof Error ? error.message : String(error),
        severity: 'critical',
      });

      return {
        success: false,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }
  }
}
