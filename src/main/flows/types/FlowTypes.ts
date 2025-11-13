import type { Page } from 'playwright';
import type { Lead } from '../../../shared/types';
import type { ArtifactManager } from '../engine/ArtifactManager';
import type { BaseTransformer } from '../core/BaseTransformer';

/**
 * Context passed to each step during execution
 */
export interface StepContext {
  page: Page;
  lead: Lead;
  artifacts: ArtifactManager;
  metadata: Record<string, unknown>;
}

/**
 * Result returned by a step
 */
export interface StepResult {
  success: boolean;
  data?: unknown;
  error?: Error;
  duration: number;
  stepName: string;
}

/**
 * Context for product execution
 */
export interface ExecutionContext {
  lead: Lead;
  credentials: PlatformCredentials;
  page: Page;
  artifacts: ArtifactManager;
  transformer: BaseTransformer<unknown>;
}

/**
 * Platform credentials (decrypted)
 */
export interface PlatformCredentials {
  platform: string;
  login: string;
  password: string;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  headless?: boolean;
  timeout?: number;
  retries?: number;
  screenshots?: boolean;
  video?: boolean;
}

/**
 * Step metadata for logging/debugging
 */
export interface StepMetadata {
  name: string;
  description: string;
  order: number;
  optional?: boolean;
}
