/**
 * Bulk Test Runner for Alptis
 *
 * Orchestrates bulk validation of multiple leads through the complete form workflow.
 * Uses the FlowEngine for automated step execution.
 * Handles:
 * - Authentication (one-time setup)
 * - Navigation to form for each lead
 * - Form filling and verification (4 sections)
 * - Error handling and result tracking
 */

import type { Page } from '@playwright/test';
import type { Lead } from '@/shared/types/lead';
import type { BulkTestConfig } from '../types';
import { BaseBulkTestRunner } from '../../shared/BaseBulkTestRunner';
import { FlowEngine } from '@/main/flows/engine';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { BulkTestLogger } from '../../leads';
import { getAlptisCredentials } from './credentials';
import {
  verifySection1,
  verifySection2,
  verifySection3Toggle,
  verifySection3Conjoint,
  verifySection4Toggle,
  verifySection4Enfant,
} from './verification';

/**
 * Default configuration for Alptis bulk tests
 */
const DEFAULT_CONFIG = {
  timeout: 30000,
  continueOnFailure: true,
  maxConcurrent: 1,
} as const;

/**
 * Orchestrates bulk validation testing of leads for Alptis
 *
 * Example usage:
 * ```typescript
 * const logger = new BulkTestLogger();
 * const runner = new BulkTestRunner(logger);
 *
 * await runner.initialize(page);
 * const results = await runner.runAll(page);
 * logger.printSummary();
 * ```
 */
export class BulkTestRunner extends BaseBulkTestRunner {
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
   * Now uses FlowEngine for automated step execution
   *
   * @param page - Playwright page instance
   * @param lead - Lead to validate
   */
  protected async executeValidation(page: Page, lead: Lead): Promise<void> {
    // Transform lead data
    this.logger.logStep('Transformation', 'du lead');
    const formData = LeadTransformer.transform(lead);

    const subscriberName = `${formData.adherent.prenom} ${formData.adherent.nom}`;
    const hasConjoint = !!formData.conjoint;
    const childrenCount = formData.enfants?.length || 0;

    console.log(`👤 Adhérent: ${subscriberName}`);
    console.log(`💑 Conjoint: ${hasConjoint ? 'Oui' : 'Non'}`);
    console.log(`👶 Enfants: ${childrenCount}`);

    // Create FlowEngine
    const engine = new FlowEngine({
      skipAuth: true,  // Auth already done in initialize()
      verbose: true,
      stopOnError: true,
    });

    // Execute flow using engine
    this.logger.logStep('Exécution', 'du flow automatisé');
    const result = await engine.execute('alptis_sante_select', {
      page,
      lead,
      transformedData: formData,
    });

    if (!result.success) {
      throw new Error(`Flow execution failed: ${result.error?.message || 'Unknown error'}`);
    }

    this.logger.logStepSuccess(`Flow exécuté avec succès en ${result.totalDuration}ms`);

    // Verification phase (to be integrated into steps later)
    this.logger.logStep('Vérifications', 'post-exécution');

    // Verify Section 1
    await verifySection1(page, formData);
    this.logger.logStepSuccess('Section 1 vérifiée');

    // Verify Section 2
    await verifySection2(page, formData);
    this.logger.logStepSuccess('Section 2 vérifiée');

    // Verify Section 3
    await verifySection3Toggle(page, hasConjoint);
    if (hasConjoint && formData.conjoint) {
      await verifySection3Conjoint(page, formData.conjoint);
      this.logger.logStepSuccess('Section 3 vérifiée (avec conjoint)');
    } else {
      this.logger.logStepSuccess('Section 3 vérifiée (sans conjoint)');
    }

    // Verify Section 4
    await verifySection4Toggle(page, childrenCount > 0);
    if (childrenCount > 0 && formData.enfants) {
      const lastChildIndex = formData.enfants.length - 1;
      await verifySection4Enfant(page, formData.enfants[lastChildIndex], lastChildIndex);
      this.logger.logStepSuccess(`Section 4 vérifiée (${childrenCount} enfant(s))`);
    } else {
      this.logger.logStepSuccess('Section 4 vérifiée (sans enfants)');
    }

    this.logger.logStepSuccess('Toutes les vérifications réussies');
  }
}
