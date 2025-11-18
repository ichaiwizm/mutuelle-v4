/**
 * Bulk Test Runner
 *
 * Orchestrates bulk validation of multiple leads through the complete form workflow.
 * Handles:
 * - Authentication (one-time setup)
 * - Navigation to form for each lead
 * - Form filling and verification
 * - Error handling and result tracking
 */

import type { Page } from '@playwright/test';
import type { Lead } from '@/shared/types/lead';
import type { BulkTestConfig, BulkTestResults } from '../types';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { BulkTestLogger } from './bulkTestLogger';
import { getAlptisCredentials } from './credentials';
import { loadAllLeads } from './loadLeads';
import {
  verifySection1,
  verifySection2,
  verifySection3Toggle,
  verifySection3Conjoint,
  verifySection4Toggle,
  verifySection4Enfant,
} from './verification';

/**
 * Default configuration for bulk tests
 */
const DEFAULT_CONFIG: Required<BulkTestConfig> = {
  timeout: 30000,
  continueOnFailure: true,
  maxConcurrent: 1,
};

/**
 * Orchestrates bulk validation testing of leads
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
export class BulkTestRunner {
  private readonly logger: BulkTestLogger;
  private readonly config: Required<BulkTestConfig>;

  /**
   * @param logger - Optional logger instance (creates default if not provided)
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(logger?: BulkTestLogger, config: BulkTestConfig = {}) {
    this.logger = logger ?? new BulkTestLogger();
    this.config = {
      timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
      continueOnFailure: config.continueOnFailure ?? DEFAULT_CONFIG.continueOnFailure,
      maxConcurrent: config.maxConcurrent ?? DEFAULT_CONFIG.maxConcurrent,
    };
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
   * Run bulk validation on all available leads
   *
   * @param page - Playwright page instance
   * @returns Test results summary
   */
  async runAll(page: Page): Promise<BulkTestResults> {
    const startTime = Date.now();
    const allLeads = loadAllLeads();

    for (let i = 0; i < allLeads.length; i++) {
      const lead = allLeads[i];
      await this.validateSingleLead(page, lead, i + 1, allLeads.length);
    }

    const duration = Date.now() - startTime;
    const results = this.logger.getResults();

    return {
      total: results.length,
      passed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      duration,
    };
  }

  /**
   * Validate a single lead through the complete form workflow
   *
   * @param page - Playwright page instance
   * @param lead - Lead to validate
   * @param leadNumber - Sequential number of this lead
   * @param totalLeads - Total number of leads being tested
   */
  private async validateSingleLead(
    page: Page,
    lead: Lead,
    leadNumber: number,
    totalLeads: number
  ): Promise<void> {
    this.logger.startTest(leadNumber, totalLeads, lead);

    try {
      await this.executeValidation(page, lead);

      // Extract lead info for result recording
      const formData = LeadTransformer.transform(lead);
      const subscriberName = `${formData.adherent.prenom} ${formData.adherent.nom}`;
      const hasConjoint = !!formData.conjoint;
      const childrenCount = formData.enfants?.length || 0;

      this.logger.recordSuccess(lead, subscriberName, hasConjoint, childrenCount);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.recordFailure(lead, errorMsg);

      if (!this.config.continueOnFailure) {
        throw error;
      }
    }
  }

  /**
   * Execute the complete validation workflow for a lead
   *
   * @param page - Playwright page instance
   * @param lead - Lead to validate
   */
  private async executeValidation(page: Page, lead: Lead): Promise<void> {
    // Step 1: Navigate to form
    this.logger.logStep('Navigation', 'vers le formulaire');
    const nav = new NavigationStep();
    await nav.execute(page);

    // Step 2: Transform lead data
    this.logger.logStep('Transformation', 'du lead');
    const formData = LeadTransformer.transform(lead);

    const subscriberName = `${formData.adherent.prenom} ${formData.adherent.nom}`;
    const hasConjoint = !!formData.conjoint;
    const childrenCount = formData.enfants?.length || 0;

    console.log(`👤 Adhérent: ${subscriberName}`);
    console.log(`💑 Conjoint: ${hasConjoint ? 'Oui' : 'Non'}`);
    console.log(`👶 Enfants: ${childrenCount}`);

    // Initialize form filler
    const formFiller = new FormFillOrchestrator();

    // Step 3: Fill and verify Section 1 (Mise en place)
    this.logger.logStep('Section 1', 'Mise en place du contrat');
    await formFiller.fillMiseEnPlace(page, formData);
    await verifySection1(page, formData);
    this.logger.logStepSuccess('Section 1 remplie et vérifiée');

    // Step 4: Fill and verify Section 2 (Adhérent)
    this.logger.logStep('Section 2', 'Adhérent');
    await formFiller.fillAdherent(page, formData);
    await verifySection2(page, formData);
    this.logger.logStepSuccess('Section 2 remplie et vérifiée');

    // Step 5: Fill and verify Section 3 (Conjoint)
    this.logger.logStep('Section 3', 'Conjoint');
    await formFiller.fillConjointToggle(page, hasConjoint);
    await verifySection3Toggle(page, hasConjoint);

    if (hasConjoint) {
      await formFiller.fillConjoint(page, formData.conjoint);
      await verifySection3Conjoint(page, formData.conjoint);
      this.logger.logStepSuccess('Section 3 remplie et vérifiée (avec conjoint)');
    } else {
      this.logger.logStepSuccess('Section 3 vérifiée (sans conjoint)');
    }

    // Step 6: Fill and verify Section 4 (Enfants)
    this.logger.logStep('Section 4', 'Enfants');
    const hasEnfants = childrenCount > 0;
    await formFiller.fillEnfantsToggle(page, hasEnfants);
    await verifySection4Toggle(page, hasEnfants);

    if (hasEnfants && formData.enfants) {
      await formFiller.fillEnfants(page, formData.enfants);
      // Verify only the last child (accordion behavior)
      const lastChildIndex = formData.enfants.length - 1;
      await verifySection4Enfant(page, formData.enfants[lastChildIndex], lastChildIndex);
      this.logger.logStepSuccess(`Section 4 remplie et vérifiée (${childrenCount} enfant(s))`);
    } else {
      this.logger.logStepSuccess('Section 4 vérifiée (sans enfants)');
    }

    // Step 7: Check for validation errors
    this.logger.logStep('Vérification', 'des erreurs de validation');
    const errors = await formFiller.checkForErrors(page);

    if (errors.length > 0) {
      throw new Error(`Erreurs de validation détectées: ${errors.join(', ')}`);
    }

    this.logger.logStepSuccess('Aucune erreur de validation');
  }

  /**
   * Get the logger instance
   * Useful for accessing results or customizing logging behavior
   */
  getLogger(): BulkTestLogger {
    return this.logger;
  }
}
