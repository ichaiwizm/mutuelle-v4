/**
 * Bulk test logging and result collection
 *
 * Provides utilities for:
 * - Collecting test results (success/failure)
 * - Logging test execution progress
 * - Formatting and displaying results
 *
 * Architecture:
 * - BulkTestResultCollector: Manages test results (no logging)
 * - ResultFormatter: Formats results for display
 * - BulkTestLogger: Main facade combining logging and result collection
 */

import type { Lead } from '@/shared/types/lead';
import type { LeadTestResult, TestStatistics } from '../alptis/types';
import type { ITestLogger } from '../alptis/helpers/logging';
import { ConsoleTestLogger } from '../alptis/helpers/logging';

/**
 * Collects and aggregates test results
 * Pure data management - no console output
 */
export class BulkTestResultCollector {
  private readonly results: LeadTestResult[] = [];
  private currentTestStart = 0;
  private currentLeadNumber = 0;

  /**
   * Start tracking a new test
   * @param leadNumber - Sequential number of the lead being tested
   */
  startTest(leadNumber: number): void {
    this.currentTestStart = Date.now();
    this.currentLeadNumber = leadNumber;
  }

  /**
   * Record a successful test result
   */
  recordSuccess(result: Omit<LeadTestResult, 'leadNumber' | 'success' | 'duration'>): void {
    const duration = Date.now() - this.currentTestStart;
    this.results.push({
      ...result,
      leadNumber: this.currentLeadNumber,
      success: true,
      duration,
    });
  }

  /**
   * Record a failed test result
   */
  recordFailure(
    result: Omit<LeadTestResult, 'leadNumber' | 'success' | 'duration'> & { error: string }
  ): void {
    const duration = Date.now() - this.currentTestStart;
    this.results.push({
      ...result,
      leadNumber: this.currentLeadNumber,
      success: false,
      duration,
    });
  }

  /**
   * Get all results (immutable copy)
   */
  getResults(): readonly LeadTestResult[] {
    return [...this.results];
  }

  /**
   * Get aggregated statistics
   */
  getStatistics(): TestStatistics {
    const total = this.results.length;
    const successCount = this.results.filter((r) => r.success).length;
    const failureCount = total - successCount;
    const avgDuration =
      total > 0 ? this.results.reduce((sum, r) => sum + r.duration, 0) / total : 0;

    return {
      total,
      successCount,
      failureCount,
      successRate: total > 0 ? (successCount / total) * 100 : 0,
      avgDuration,
    };
  }

  /**
   * Get number of failures
   */
  getFailureCount(): number {
    return this.results.filter((r) => !r.success).length;
  }

  /**
   * Get success rate as percentage
   */
  getSuccessRate(): number {
    const stats = this.getStatistics();
    return stats.successRate;
  }

  /**
   * Reset collector for reuse
   */
  reset(): void {
    this.results.length = 0;
    this.currentTestStart = 0;
    this.currentLeadNumber = 0;
  }
}

/**
 * Formats and displays test results
 * Separated from collection logic for flexibility
 */
export class ResultFormatter {
  constructor(private readonly logger: ITestLogger) {}

  /**
   * Print complete summary of test results
   */
  printSummary(stats: TestStatistics, results: readonly LeadTestResult[]): void {
    this.logger.logHeader('RÉSUMÉ FINAL');

    this.printStatistics(stats);

    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      this.printFailures(failures);
    }

    this.printDetailedResults(results);

    this.logger.logSeparator(true);
  }

  /**
   * Print global statistics
   */
  private printStatistics(stats: TestStatistics): void {
    console.log('\n📊 STATISTIQUES GLOBALES');
    console.log(`   Total de leads testés: ${stats.total}`);
    console.log(`   Succès: ${stats.successCount} (${stats.successRate.toFixed(1)}%)`);
    console.log(`   Échecs: ${stats.failureCount}`);
    console.log(`   Durée moyenne: ${stats.avgDuration.toFixed(0)}ms par lead`);
  }

  /**
   * Print failure details
   */
  private printFailures(failures: readonly LeadTestResult[]): void {
    console.log(`\n❌ LEADS EN ÉCHEC (${failures.length}):`);
    failures.forEach((r) => {
      const family = this.formatFamilyInfo(r.hasConjoint, r.childrenCount);
      console.log(`   • Lead ${r.leadNumber} - ${r.subscriber}${family}`);
      console.log(`     Erreur: ${r.error}`);
    });
  }

  /**
   * Print detailed results for all tests
   */
  private printDetailedResults(results: readonly LeadTestResult[]): void {
    console.log('\n📋 DÉTAILS PAR LEAD:');
    results.forEach((r) => {
      const status = r.success ? '✅ PASS' : '❌ FAIL';
      const family = this.formatFamilyInfo(r.hasConjoint, r.childrenCount);
      console.log(
        `   ${status} | Lead ${r.leadNumber} | ${r.subscriber}${family} | ${r.duration}ms`
      );
    });
  }

  /**
   * Format family information for display
   */
  private formatFamilyInfo(hasConjoint: boolean, childrenCount: number): string {
    const parts: string[] = [];
    if (hasConjoint) parts.push('conjoint');
    if (childrenCount > 0) parts.push(`${childrenCount} enfant(s)`);
    return parts.length > 0 ? ` [${parts.join(', ')}]` : ' [solo]';
  }
}

/**
 * Main facade for bulk test logging and result collection
 * Combines logging and result tracking in a convenient API
 */
export class BulkTestLogger {
  private readonly logger: ITestLogger;
  private readonly collector: BulkTestResultCollector;
  private readonly formatter: ResultFormatter;

  constructor(
    logger: ITestLogger = new ConsoleTestLogger(),
    collector: BulkTestResultCollector = new BulkTestResultCollector()
  ) {
    this.logger = logger;
    this.collector = collector;
    this.formatter = new ResultFormatter(logger);
  }

  /**
   * Start logging and tracking a new test
   */
  startTest(leadNumber: number, totalLeads: number, lead: Lead): void {
    this.collector.startTest(leadNumber);

    console.log('\n' + '-'.repeat(80));
    console.log(`LEAD ${leadNumber}/${totalLeads}`);
    console.log('-'.repeat(80));
    console.log(`ID: ${lead.id}`);
    console.log(`Adhérent: ${lead.subscriber.prenom} ${lead.subscriber.nom}`);
  }

  /**
   * Log a test step
   */
  logStep(step: string, details?: string): void {
    this.logger.logStep(step, details);
  }

  /**
   * Log a successful step completion
   */
  logStepSuccess(message: string): void {
    this.logger.logStepSuccess(message);
  }

  /**
   * Record a successful test
   */
  recordSuccess(
    lead: Lead,
    subscriberName: string,
    hasConjoint: boolean,
    childrenCount: number
  ): void {
    this.collector.recordSuccess({
      leadId: lead.id,
      subscriber: subscriberName,
      hasConjoint,
      childrenCount,
    });

    const duration = Date.now() - (this.collector as any).currentTestStart;
    this.logger.logSuccess(`SUCCÈS (${duration}ms)`);
  }

  /**
   * Record a failed test
   */
  recordFailure(lead: Lead, error: string): void {
    this.collector.recordFailure({
      leadId: lead.id,
      subscriber: `${lead.subscriber.prenom} ${lead.subscriber.nom}`,
      hasConjoint: !!lead.project?.conjoint,
      childrenCount: lead.children?.length || 0,
      error,
    });

    const duration = Date.now() - (this.collector as any).currentTestStart;
    this.logger.logError(`ÉCHEC (${duration}ms)`);
    console.error(`   Erreur: ${error}`);
  }

  /**
   * Print comprehensive summary of all test results
   */
  printSummary(): void {
    const stats = this.collector.getStatistics();
    const results = this.collector.getResults();
    this.formatter.printSummary(stats, results);
  }

  /**
   * Get all test results
   */
  getResults(): readonly LeadTestResult[] {
    return this.collector.getResults();
  }

  /**
   * Get number of failures
   */
  getFailureCount(): number {
    return this.collector.getFailureCount();
  }

  /**
   * Get success rate as percentage
   */
  getSuccessRate(): number {
    return this.collector.getSuccessRate();
  }

  /**
   * Reset logger for reuse
   */
  reset(): void {
    this.collector.reset();
  }
}

// Export types for convenience
export type { LeadTestResult, TestStatistics };
