/**
 * Bulk Test Runner for Alptis Santé Pro Plus
 *
 * Orchestrates bulk validation of multiple leads through the complete form workflow.
 * Uses the FlowEngine for automated step execution.
 *
 * Différences avec BulkTestRunner (Santé Select):
 * - Utilise LeadTransformer de sante-pro-plus
 * - Flow key: alptis_sante_pro_plus
 * - Verifiers: sante-pro-plus specific (pas de cadre_exercice pour conjoint)
 */

import type { Page } from '@playwright/test';
import type { Lead } from '@/shared/types/lead';
import type { BulkTestConfig } from '../types';
import { BaseBulkTestRunner } from '../../shared/BaseBulkTestRunner';
import { FlowEngine } from '@/main/flows/engine';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-pro-plus/transformers/LeadTransformer';
import { BulkTestLogger } from '../../leads';
import { getAlptisCredentials } from './credentials';
import {
  verifySection1,
  verifySection2,
  verifySection3Toggle,
  verifySection3Conjoint,
  verifySection4Toggle,
  verifySection4Enfant,
} from './verification/sante-pro-plus';

/**
 * Default configuration for Santé Pro Plus bulk tests
 */
const DEFAULT_CONFIG = {
  timeout: 30000,
  continueOnFailure: true,
  maxConcurrent: 1,
} as const;

/**
 * Orchestrates bulk validation testing of leads for Alptis Santé Pro Plus
 *
 * Example usage:
 * ```typescript
 * const logger = new BulkTestLogger();
 * const runner = new SanteProPlusBulkTestRunner(logger);
 *
 * await runner.initialize(page);
 * const results = await runner.runAll(page);
 * logger.printSummary();
 * ```
 */
export class SanteProPlusBulkTestRunner extends BaseBulkTestRunner {
  /**
   * @param logger - Optional logger instance (creates default if not provided)
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(logger?: BulkTestLogger, config: BulkTestConfig = {}) {
    super(logger, config, DEFAULT_CONFIG);
  }

  /**
   * Initialize the test environment
   * Performs one-time authentication to Alptis platform
   *
   * @param page - Playwright page instance
   */
  async initialize(page: Page): Promise<void> {
    const auth = new AlptisAuth(getAlptisCredentials());
    await auth.login(page);
  }

  /**
   * Extract lead metadata for result recording
   *
   * @param lead - Lead to extract metadata from
   * @returns Tuple of [subscriberName, hasConjoint, childrenCount]
   */
  protected extractLeadMetadata(lead: Lead): [string, boolean, number] {
    const formData = LeadTransformer.transform(lead);
    const subscriberName = `${formData.adherent.prenom} ${formData.adherent.nom}`;
    const hasConjoint = !!formData.conjoint;
    const childrenCount = formData.enfants?.length || 0;

    return [subscriberName, hasConjoint, childrenCount];
  }

  /**
   * Execute the complete validation workflow for a lead
   * Uses FlowEngine for automated step execution with Santé Pro Plus flow
   *
   * @param page - Playwright page instance
   * @param lead - Lead to validate
   */
  protected async executeValidation(page: Page, lead: Lead): Promise<void> {
    // Transform lead data using Santé Pro Plus transformer
    this.logger.logStep('Transformation', 'du lead (Sante Pro Plus)');
    const formData = LeadTransformer.transform(lead);

    const subscriberName = `${formData.adherent.prenom} ${formData.adherent.nom}`;
    const hasConjoint = !!formData.conjoint;
    const childrenCount = formData.enfants?.length || 0;

    console.log(`Adherent: ${subscriberName}`);
    console.log(`Conjoint: ${hasConjoint ? 'Oui (sans cadre exercice)' : 'Non'}`);
    console.log(`Enfants: ${childrenCount}`);
    console.log(`Micro-entrepreneur: ${formData.adherent.micro_entrepreneur}`);
    console.log(`Ville: ${formData.adherent.ville}`);
    if (formData.adherent.statut_professionnel) {
      console.log(`Statut professionnel: ${formData.adherent.statut_professionnel}`);
    }

    // Create FlowEngine
    const engine = new FlowEngine({
      skipAuth: true,  // Auth already done in initialize()
      verbose: true,
      stopOnError: true,
    });

    // Execute flow using engine - SANTÉ PRO PLUS flow key
    this.logger.logStep('Execution', 'du flow automatise (Sante Pro Plus)');
    const result = await engine.execute('alptis_sante_pro_plus', {
      page,
      lead,
      transformedData: formData,
    });

    if (!result.success) {
      throw new Error(`Flow execution failed: ${result.error?.message || 'Unknown error'}`);
    }

    this.logger.logStepSuccess(`Flow execute avec succes en ${result.totalDuration}ms`);

    // Verification phase (to be integrated into steps later)
    this.logger.logStep('Verifications', 'post-execution (Sante Pro Plus)');

    // Verify Section 1
    await verifySection1(page, formData);
    this.logger.logStepSuccess('Section 1 verifiee');

    // Verify Section 2 (includes micro_entrepreneur, ville, statut_professionnel)
    await verifySection2(page, formData);
    this.logger.logStepSuccess('Section 2 verifiee (+ micro-entrepreneur, ville, statut)');

    // Verify Section 3 (simplified - no cadre_exercice for conjoint)
    await verifySection3Toggle(page, hasConjoint);
    if (hasConjoint && formData.conjoint) {
      await verifySection3Conjoint(page, formData.conjoint);
      this.logger.logStepSuccess('Section 3 verifiee (conjoint simplifie)');
    } else {
      this.logger.logStepSuccess('Section 3 verifiee (sans conjoint)');
    }

    // Verify Section 4
    await verifySection4Toggle(page, childrenCount > 0);
    if (childrenCount > 0 && formData.enfants) {
      const lastChildIndex = formData.enfants.length - 1;
      await verifySection4Enfant(page, formData.enfants[lastChildIndex], lastChildIndex);
      this.logger.logStepSuccess(`Section 4 verifiee (${childrenCount} enfant(s))`);
    } else {
      this.logger.logStepSuccess('Section 4 verifiee (sans enfants)');
    }

    this.logger.logStepSuccess('Toutes les verifications reussies (Sante Pro Plus)');
  }
}
