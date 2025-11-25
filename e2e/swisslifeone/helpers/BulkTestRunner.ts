/**
 * Bulk Test Runner for SwissLife One
 *
 * Orchestrates bulk validation of multiple leads through the complete form workflow.
 * Uses the FlowEngine for automated step execution.
 * Handles:
 * - Authentication (one-time setup)
 * - Navigation to form for each lead (with iframe loading)
 * - Form filling and verification (7 sections)
 * - Error handling and result tracking
 */

import type { Page } from '@playwright/test';
import type { Lead } from '@/shared/types/lead';
import type { BulkTestConfig } from '../types';
import { BaseBulkTestRunner } from '../../shared/BaseBulkTestRunner';
import { FlowEngine } from '@/main/flows/engine';
import { SwissLifeOneAuth } from '@/main/flows/platforms/swisslifeone/lib/SwissLifeOneAuth';
import { SwissLifeOneLeadTransformer } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/LeadTransformer';
import { createSwissLifeServices } from '@/main/flows/engine/services';
import type { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import { BulkTestLogger } from '../../leads';
import { getSwissLifeOneCredentials } from './credentials';
import {
  verifyStep1Section1,
  verifyStep1Section2,
  verifyStep1Section3,
  verifyStep1Section4,
  verifyStep1Section5,
  verifyStep1Section6,
  verifyStep1Section7,
} from './verification';

/**
 * Default configuration for SwissLife One bulk tests
 * Note: SwissLife One needs longer timeouts due to iframe loading (~45s)
 */
const DEFAULT_CONFIG = {
  timeout: 180000, // 3 minutes per lead (iframe is SLOW)
  continueOnFailure: true,
  maxConcurrent: 1,
} as const;

/**
 * Orchestrates bulk validation testing of leads for SwissLife One
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
   * Performs one-time authentication to SwissLife One platform (ADFS/SAML)
   *
   * @param page - Playwright page instance
   */
  async initialize(page: Page): Promise<void> {
    const auth = new SwissLifeOneAuth(getSwissLifeOneCredentials());
    await auth.login(page);
  }

  /**
   * Extract lead metadata for result recording
   *
   * @param lead - Lead to extract metadata from
   * @returns Tuple of [subscriberName, hasConjoint, childrenCount]
   */
  protected extractLeadMetadata(lead: Lead): [string, boolean, number] {
    const formData = SwissLifeOneLeadTransformer.transform(lead);
    const subscriberName = `${formData.assure_principal.date_naissance}`;
    const hasConjoint = !!formData.conjoint;
    const childrenCount = formData.enfants?.nombre_enfants || 0;

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
    const formData = SwissLifeOneLeadTransformer.transform(lead);

    const hasConjoint = !!formData.conjoint;
    const childrenCount = formData.enfants?.nombre_enfants || 0;

    console.log(`👤 Assuré principal: ${formData.assure_principal.date_naissance}`);
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
    const result = await engine.execute('swisslife_one_slsis', {
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

    // Get iframe for verification
    const services = createSwissLifeServices();
    const nav = services.navigation as SwissLifeNavigationStep;
    const frame = await nav.getIframe(page);

    // Verify all sections
    await verifyStep1Section1(frame, formData);
    this.logger.logStepSuccess('Section 1 vérifiée');

    await verifyStep1Section2(frame, formData);
    this.logger.logStepSuccess('Section 2 vérifiée');

    await verifyStep1Section3(frame, formData);
    this.logger.logStepSuccess('Section 3 vérifiée');

    await verifyStep1Section4(frame, formData);
    this.logger.logStepSuccess('Section 4 vérifiée');

    await verifyStep1Section5(frame, formData);
    if (hasConjoint) {
      this.logger.logStepSuccess('Section 5 vérifiée (avec conjoint)');
    } else {
      this.logger.logStepSuccess('Section 5 vérifiée (sans conjoint)');
    }

    await verifyStep1Section6(frame, formData);
    if (childrenCount > 0) {
      this.logger.logStepSuccess(`Section 6 vérifiée (${childrenCount} enfant(s))`);
    } else {
      this.logger.logStepSuccess('Section 6 vérifiée (sans enfants)');
    }

    await verifyStep1Section7(frame, formData);
    this.logger.logStepSuccess('Section 7 vérifiée');

    this.logger.logStepSuccess('Toutes les vérifications réussies');
  }
}
