/**
 * Bulk Test Runner for SwissLife One
 *
 * Orchestrates bulk validation of multiple leads through the complete form workflow.
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
import { SwissLifeOneAuth } from '@/main/flows/platforms/swisslifeone/lib/SwissLifeOneAuth';
import { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import { FormFillOrchestrator } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill';
import { SwissLifeOneLeadTransformer } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/LeadTransformer';
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
   * SwissLife One has 7 sections in Step 1
   *
   * @param page - Playwright page instance
   * @param lead - Lead to validate
   */
  protected async executeValidation(page: Page, lead: Lead): Promise<void> {
    // Step 1: Navigate to form and get iframe
    this.logger.logStep('Navigation', 'vers le formulaire (iframe loading...)');
    const nav = new SwissLifeNavigationStep();
    await nav.execute(page);
    const frame = await nav.getIframe(page);

    // Step 2: Transform lead data
    this.logger.logStep('Transformation', 'du lead');
    const formData = SwissLifeOneLeadTransformer.transform(lead);

    const hasConjoint = !!formData.conjoint;
    const childrenCount = formData.enfants?.nombre_enfants || 0;

    console.log(`👤 Assuré principal: ${formData.assure_principal.date_naissance}`);
    console.log(`💑 Conjoint: ${hasConjoint ? 'Oui' : 'Non'}`);
    console.log(`👶 Enfants: ${childrenCount}`);

    // Initialize form filler
    const formFiller = new FormFillOrchestrator();

    // Step 3: Fill and verify Section 1 (Nom du projet)
    this.logger.logStep('Section 1', 'Nom du projet');
    await formFiller.fillStep1Section1(frame, formData);
    await verifyStep1Section1(frame, formData);
    this.logger.logStepSuccess('Section 1 remplie et vérifiée');

    // Step 4: Fill and verify Section 2 (Besoins)
    this.logger.logStep('Section 2', 'Besoins');
    await formFiller.fillStep1Section2(frame, formData);
    await verifyStep1Section2(frame, formData);
    this.logger.logStepSuccess('Section 2 remplie et vérifiée');

    // Step 5: Fill and verify Section 3 (Type simulation)
    this.logger.logStep('Section 3', 'Type de simulation');
    await formFiller.fillStep1Section3(frame, formData);
    await verifyStep1Section3(frame, formData);
    this.logger.logStepSuccess('Section 3 remplie et vérifiée');

    // Step 6: Fill and verify Section 4 (Assuré principal)
    this.logger.logStep('Section 4', 'Assuré principal');
    await formFiller.fillStep1Section4(frame, formData);
    await verifyStep1Section4(frame, formData);
    this.logger.logStepSuccess('Section 4 remplie et vérifiée');

    // Step 7: Fill and verify Section 5 (Conjoint - conditional)
    this.logger.logStep('Section 5', 'Conjoint');
    await formFiller.fillStep1Section5(frame, formData);
    await verifyStep1Section5(frame, formData);

    if (hasConjoint) {
      this.logger.logStepSuccess('Section 5 remplie et vérifiée (avec conjoint)');
    } else {
      this.logger.logStepSuccess('Section 5 vérifiée (sans conjoint)');
    }

    // Step 8: Fill and verify Section 6 (Enfants - conditional)
    this.logger.logStep('Section 6', 'Enfants');
    await formFiller.fillStep1Section6(frame, formData);
    await verifyStep1Section6(frame, formData);

    if (childrenCount > 0) {
      this.logger.logStepSuccess(`Section 6 remplie et vérifiée (${childrenCount} enfant(s))`);
    } else {
      this.logger.logStepSuccess('Section 6 vérifiée (sans enfants)');
    }

    // Step 9: Fill and verify Section 7 (Gammes et Options - final section)
    this.logger.logStep('Section 7', 'Gammes et Options');
    await formFiller.fillStep1Section7(frame, formData);
    await verifyStep1Section7(frame, formData);
    this.logger.logStepSuccess('Section 7 remplie et vérifiée');

    // Step 10: Check for validation errors
    this.logger.logStep('Vérification', 'des erreurs de validation');
    const errors = await formFiller.checkForErrors(frame);

    if (errors.length > 0) {
      throw new Error(`Erreurs de validation détectées: ${errors.join(', ')}`);
    }

    this.logger.logStepSuccess('Aucune erreur de validation');
  }
}
