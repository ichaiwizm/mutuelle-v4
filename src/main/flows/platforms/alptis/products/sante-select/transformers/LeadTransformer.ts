/**
 * Transformateur principal pour Alptis Santé Select
 *
 * Transforme un Lead AssurProspect en données formatées pour Alptis
 */

import type { Lead, AlptisFormData, TransformResult, TransformError, TransformWarning } from './types';
import { validateLead } from './validators/lead-validator';
import { transformSubscriber } from './transformers/subscriber-transformer';
import { transformProject } from './transformers/project-transformer';
import { transformConjoint } from './transformers/conjoint-transformer';
import { transformChildren } from './transformers/children-transformer';

export class LeadTransformer {
  /**
   * Transforme un lead AssurProspect en données Alptis
   */
  static transform(lead: Lead): AlptisFormData {
    console.log('\n========================================');
    console.log('LEAD TRANSFORMATION START');
    console.log('========================================');
    console.log('Lead ID:', lead.id);

    // 1. Validation pré-transformation
    console.log('\n[VALIDATION] Validating lead...');
    const validation = validateLead(lead);
    if (!validation.valid) {
      console.error('[VALIDATION] Validation failed:', validation.errors);
      throw new Error(`Lead validation failed:\n${validation.errors.join('\n')}`);
    }
    console.log('[VALIDATION] ✓ Lead is valid');

    // 2. Transformer chaque section
    const adherent = transformSubscriber(lead);
    const mise_en_place = transformProject(lead);
    const conjoint = transformConjoint(lead);
    const enfants = transformChildren(lead, adherent.regime_obligatoire);

    // 3. Construire le résultat
    const result: AlptisFormData = {
      mise_en_place,
      adherent,
      ...(conjoint && { conjoint }),
      ...(enfants && { enfants }),
    };

    console.log('\n========================================');
    console.log('LEAD TRANSFORMATION COMPLETE');
    console.log('========================================');
    console.log('Final result:', JSON.stringify(result, null, 2));

    return result;
  }

  /**
   * Transforme un lead avec gestion complète des erreurs
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
