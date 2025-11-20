/**
 * Shared types for SwissLifeOne E2E tests
 *
 * This file centralizes all common types used across the test suite
 * to avoid duplication and maintain consistency.
 */

import type { Lead } from '@/shared/types/lead';

// Re-export Lead type for convenience
export type { Lead };

/**
 * Note: Additional types can be added here as the test suite grows.
 * Examples from Alptis that could be implemented:
 * - LeadType for filtering (solo/conjoint/children/both)
 * - LeadTestResult for bulk testing
 * - BulkTestConfig for test orchestration
 * - LogLevel enum for logging
 */
