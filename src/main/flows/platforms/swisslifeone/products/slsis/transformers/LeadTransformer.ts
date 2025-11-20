/**
 * SwissLifeOne SLSIS Lead Transformer
 * Transforme un Lead en données formattées pour SwissLifeOne Step 1
 */

import type { Lead } from '@/shared/types/lead';
import type { SwissLifeOneFormData, TransformResult, TransformError, TransformWarning } from './types';
import { validateLead } from './validators/lead-validator';
import { transformSubscriber } from './transformers/subscriber-transformer';
import { transformConjoint } from './transformers/conjoint-transformer';
import { transformChildren } from './transformers/children-transformer';
import {
  transformProjet,
  transformBesoins,
  determineTypeSimulation,
  transformGammesOptions,
} from './transformers/project-transformer';

/**
 * Classe principale de transformation pour SwissLifeOne
 *
 * Transforme un Lead standard en données formattées pour le formulaire SwissLifeOne SLSIS Step 1
 * Pas de logique de swap (contrairement à Alptis)
 */
export class SwissLifeOneLeadTransformer {
  /**
   * Transforme un Lead en données SwissLifeOne
   *
   * @param lead - Lead à transformer
   * @returns Données formattées pour SwissLifeOne Step 1
   * @throws Error si la validation échoue ou si des données critiques sont manquantes
   */
  static transform(lead: Lead): SwissLifeOneFormData {
    console.log('[SWISSLIFEONE] Starting transformation for lead:', lead.id);

    // 1. Validation du Lead
    console.log('[SWISSLIFEONE] Step 1/6: Validating lead');
    const validation = validateLead(lead);
    if (!validation.valid) {
      const errorMessage = `Lead validation failed:\n${validation.errors.join('\n')}`;
      console.error('[SWISSLIFEONE] Validation errors:', validation.errors);
      throw new Error(errorMessage);
    }
    console.log('[SWISSLIFEONE] Lead validation passed');

    // 2. Transform Assuré Principal
    console.log('[SWISSLIFEONE] Step 2/6: Transforming subscriber (assuré principal)');
    const assurePrincipal = transformSubscriber(lead);
    console.log('[SWISSLIFEONE] Subscriber transformed:', {
      age: assurePrincipal.date_naissance,
      dept: assurePrincipal.departement_residence,
      regime: assurePrincipal.regime_social,
      profession: assurePrincipal.profession,
      statut: assurePrincipal.statut,
    });

    // 3. Transform Projet
    console.log('[SWISSLIFEONE] Step 3/6: Transforming project data');
    const projet = transformProjet(lead);
    const besoins = transformBesoins();
    const typeSimulation = determineTypeSimulation(lead);
    console.log('[SWISSLIFEONE] Project transformed:', {
      nomProjet: projet.nom_projet,
      typeSimulation,
    });

    // 4. Transform Conjoint (optionnel)
    console.log('[SWISSLIFEONE] Step 4/6: Transforming conjoint (if exists)');
    const conjoint = transformConjoint(lead);
    if (conjoint) {
      console.log('[SWISSLIFEONE] Conjoint transformed:', {
        age: conjoint.date_naissance,
        regime: conjoint.regime_social,
        profession: conjoint.profession,
      });
    } else {
      console.log('[SWISSLIFEONE] No conjoint data');
    }

    // 5. Transform Enfants (optionnel)
    console.log('[SWISSLIFEONE] Step 5/6: Transforming children (if exist)');
    const enfants = transformChildren(lead);
    if (enfants) {
      console.log(`[SWISSLIFEONE] ${enfants.nombre_enfants} children transformed`);
    } else {
      console.log('[SWISSLIFEONE] No children data');
    }

    // 6. Transform Gammes et Options
    console.log('[SWISSLIFEONE] Step 6/6: Transforming gammes and options');
    const gammesOptions = transformGammesOptions(lead, assurePrincipal.regime_social);
    console.log('[SWISSLIFEONE] Gammes and options transformed:', {
      gamme: gammesOptions.gamme,
      dateEffet: gammesOptions.date_effet,
      loiMadelin: gammesOptions.loi_madelin,
    });

    // Assembler le résultat final
    const result: SwissLifeOneFormData = {
      projet,
      besoins,
      type_simulation: typeSimulation,
      assure_principal: assurePrincipal,
      ...(conjoint && { conjoint }),
      ...(enfants && { enfants }),
      gammes_options: gammesOptions,
    };

    console.log('[SWISSLIFEONE] Transformation completed successfully');
    return result;
  }

  /**
   * Transforme un Lead avec gestion d'erreurs complète
   *
   * @param lead - Lead à transformer
   * @returns Résultat de transformation avec success/errors/warnings
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SWISSLIFEONE] Transformation failed:', errorMessage);

      errors.push({
        code: 'TRANSFORM_ERROR',
        message: errorMessage,
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
