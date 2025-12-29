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
import { mapProfession } from './mappers/profession-mapper';
import { formatDate, getDateEffet, isValidDateEffet } from './utils';
import { getDepartementFromCodePostal } from './utils';

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
