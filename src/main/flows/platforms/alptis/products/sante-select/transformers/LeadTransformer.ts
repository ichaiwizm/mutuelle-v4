/**
 * Transformateur principal pour Alptis Santé Select
 *
 * Transforme un Lead AssurProspect en données formatées pour Alptis
 */

import type { Lead, AlptisFormData, TransformResult, TransformError, TransformWarning } from './types';
import { validateLead } from './validators/lead-validator';
import { determineEligibility } from './validators/eligibility-validator';
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

    // 2. Vérification de l'éligibilité et swap si nécessaire
    console.log('\n[ELIGIBILITY] Checking eligibility...');
    const eligibility = determineEligibility(lead);

    console.log(`[ELIGIBILITY] Adhérent: ${eligibility.subscriberEligible ? '✅' : '❌'} ${eligibility.subscriberReason || ''}`);
    if (eligibility.conjointReason) {
      console.log(`[ELIGIBILITY] Conjoint: ${eligibility.conjointEligible ? '✅' : '❌'} ${eligibility.conjointReason}`);
    }

    let processedLead = lead;

    if (eligibility.shouldSwap) {
      console.log('\n[SWAP] ⚠️  Adhérent non éligible mais conjoint éligible');
      console.log('[SWAP] → Swap automatique : adhérent ↔ conjoint (profession, régime, date de naissance)');

      // Créer un lead avec swap des données d'éligibilité
      processedLead = {
        ...lead,
        subscriber: {
          ...lead.subscriber,
          // On garde civilité, nom, prénom, coordonnées de l'adhérent original
          // On swap uniquement les données qui affectent l'éligibilité
          profession: lead.project?.conjoint?.profession || lead.subscriber.profession,
          regimeSocial: lead.project?.conjoint?.regimeSocial || lead.subscriber.regimeSocial,
          dateNaissance: lead.project?.conjoint?.dateNaissance || lead.subscriber.dateNaissance,
        },
        project: {
          ...lead.project!,
          conjoint: lead.project?.conjoint ? {
            ...lead.project.conjoint,
            // Le conjoint récupère les données pro de l'adhérent original
            profession: lead.subscriber.profession,
            regimeSocial: lead.subscriber.regimeSocial,
            dateNaissance: lead.subscriber.dateNaissance,
          } : undefined,
        },
      };

      console.log('[SWAP] ✓ Swap effectué avec succès');
    } else if (!eligibility.subscriberEligible && !eligibility.conjointEligible) {
      console.log('\n[ELIGIBILITY] ⚠️  WARNING: Ni l\'adhérent ni le conjoint ne sont éligibles');
      console.log('[ELIGIBILITY] → Transformation continue (l\'API Alptis retournera une erreur)');
    } else {
      console.log('[ELIGIBILITY] ✓ Adhérent éligible, pas de swap nécessaire');
    }

    // 3. Transformer chaque section (avec le lead potentiellement swappé)
    const adherent = transformSubscriber(processedLead);
    const mise_en_place = transformProject(processedLead);
    const conjoint = transformConjoint(processedLead);
    const enfants = transformChildren(processedLead, adherent.regime_obligatoire);

    // 4. Construire le résultat
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
