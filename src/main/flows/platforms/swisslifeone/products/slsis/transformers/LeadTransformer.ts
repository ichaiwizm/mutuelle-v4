/**
 * SwissLifeOne SLSIS Lead Transformer
 * Transforme un Lead en donnees formattees pour SwissLifeOne Step 1
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

const DEBUG = process.env.NODE_ENV === 'development';

function log(message: string, data?: Record<string, unknown>): void {
  if (DEBUG) {
    console.log(`[SwissLifeOne] ${message}`, data ? JSON.stringify(data) : '');
  }
}

/**
 * Classe principale de transformation pour SwissLifeOne
 *
 * Transforme un Lead standard en donnees formattees pour le formulaire SwissLifeOne SLSIS Step 1
 * Pas de logique de swap (contrairement a Alptis)
 */
export class SwissLifeOneLeadTransformer {
  /**
   * Transforme un Lead en donnees SwissLifeOne
   *
   * @param lead - Lead a transformer
   * @returns Donnees formattees pour SwissLifeOne Step 1
   * @throws Error si la validation echoue ou si des donnees critiques sont manquantes
   */
  static transform(lead: Lead): SwissLifeOneFormData {
    log('Starting transformation', { leadId: lead.id });

    // 1. Validation du Lead
    const validation = validateLead(lead);
    if (!validation.valid) {
      const errorMessage = `Lead validation failed:\n${validation.errors.join('\n')}`;
      throw new Error(errorMessage);
    }

    // 2. Transform Assure Principal
    const assurePrincipal = transformSubscriber(lead);
    log('Subscriber transformed', {
      dept: assurePrincipal.departement_residence,
      regime: assurePrincipal.regime_social,
    });

    // 3. Transform Projet
    const projet = transformProjet(lead);
    const besoins = transformBesoins();
    const typeSimulation = determineTypeSimulation(lead);
    log('Project transformed', { nomProjet: projet.nom_projet, typeSimulation });

    // 4. Transform Conjoint (optionnel)
    const conjoint = transformConjoint(lead);
    if (conjoint) {
      log('Conjoint transformed', { regime: conjoint.regime_social });
    }

    // 5. Transform Enfants (optionnel)
    const enfants = transformChildren(lead);
    if (enfants) {
      log('Children transformed', { count: enfants.nombre_enfants });
    }

    // 6. Transform Gammes et Options
    const gammesOptions = transformGammesOptions(lead, assurePrincipal.regime_social);
    log('Gammes transformed', {
      gamme: gammesOptions.gamme,
      loiMadelin: gammesOptions.loi_madelin,
    });

    // Assembler le resultat final
    const result: SwissLifeOneFormData = {
      projet,
      besoins,
      type_simulation: typeSimulation,
      assure_principal: assurePrincipal,
      ...(conjoint && { conjoint }),
      ...(enfants && { enfants }),
      gammes_options: gammesOptions,
    };

    log('Transformation complete', { leadId: lead.id });

    return result;
  }

  /**
   * Transforme un Lead avec gestion d'erreurs complete
   *
   * @param lead - Lead a transformer
   * @returns Resultat de transformation avec success/errors/warnings
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
