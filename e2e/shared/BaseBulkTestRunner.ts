/**
 * Base Bulk Test Runner
 *
 * Abstract base class for orchestrating bulk validation of multiple leads.
 * Provides common infrastructure for:
 * - Authentication handling
 * - Lead iteration and result tracking
 * - Error handling
 * - Result aggregation
 *
 * Platform-specific implementations must provide:
 * - Authentication logic
 * - Validation workflow execution
 */

import type { Page } from '@playwright/test';
import type { Lead } from '@/shared/types/lead';
import type { BulkTestConfig, BulkTestResults } from '../leads/types';
import { BulkTestLogger, loadAllLeads } from '../leads';

/**
 * Abstract base class for bulk test runners
 * Implements the Template Method pattern for platform-agnostic bulk testing
 */
export abstract class BaseBulkTestRunner {
  protected readonly logger: BulkTestLogger;
  protected readonly config: Required<BulkTestConfig>;

  /**
   * @param logger - Optional logger instance (creates default if not provided)
   * @param config - Optional configuration (uses defaults if not provided)
   * @param defaultConfig - Platform-specific default configuration
   */
  constructor(
    logger?: BulkTestLogger,
    config: BulkTestConfig = {},
    defaultConfig: Required<BulkTestConfig> = {
      timeout: 30000,
      continueOnFailure: true,
      maxConcurrent: 1,
    }
  ) {
    this.logger = logger ?? new BulkTestLogger();
    this.config = {
      timeout: config.timeout ?? defaultConfig.timeout,
      continueOnFailure: config.continueOnFailure ?? defaultConfig.continueOnFailure,
      maxConcurrent: config.maxConcurrent ?? defaultConfig.maxConcurrent,
    };
  }

  /**
   * Initialize the test environment (platform-specific)
   * Must perform authentication to the target platform
   *
   * @param page - Playwright page instance
   */
  abstract initialize(page: Page): Promise<void>;

  /**
   * Execute the complete validation workflow for a lead (platform-specific)
   * Must implement the full form filling and verification process
   *
   * @param page - Playwright page instance
   * @param lead - Lead to validate
   */
  protected abstract executeValidation(page: Page, lead: Lead): Promise<void>;

  /**
   * Extract lead metadata for result recording (platform-specific)
   * Returns subscriber name, conjoint status, and children count
   *
   * @param lead - Lead to extract metadata from
   * @returns Tuple of [subscriberName, hasConjoint, childrenCount]
   */
  protected abstract extractLeadMetadata(lead: Lead): [string, boolean, number];

  /**
   * Run bulk validation on all available leads
   * This is the main entry point for bulk testing
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
   * Template method that orchestrates the validation process
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

      // Extract lead metadata for result recording
      const [subscriberName, hasConjoint, childrenCount] = this.extractLeadMetadata(lead);

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
   * Get the logger instance
   * Useful for accessing results or customizing logging behavior
   */
  getLogger(): BulkTestLogger {
    return this.logger;
  }
}
