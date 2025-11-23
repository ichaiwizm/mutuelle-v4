import type { Page } from "playwright";
import type { Lead } from "../../db/schema";
import type { StepDefinition } from "../../../shared/types/product";

/**
 * Credentials for platform authentication
 */
export type PlatformCredentials = {
  login: string;
  password: string;
};

/**
 * Execution context passed to all steps
 * Contains all resources a step might need
 */
export type ExecutionContext<T = any> = {
  page: Page;                          // Playwright page instance
  lead?: Lead;                         // Lead data (optional, depends on step)
  transformedData?: T;                 // Transformed lead data in platform format
  credentials?: PlatformCredentials;   // Platform credentials (optional)
  artifactsDir?: string;               // Directory for screenshots/videos
  flowKey: string;                     // Flow identifier
  stepDefinition: StepDefinition;      // Current step definition
};

/**
 * Result of a step execution
 */
export type StepResult = {
  success: boolean;                    // Whether the step succeeded
  stepId: string;                      // Step identifier
  error?: Error;                       // Error if failed
  duration: number;                    // Execution duration in ms
  retries: number;                     // Number of retries attempted
  metadata?: Record<string, any>;      // Additional metadata
};

/**
 * Interface that all Step implementations must follow
 */
export interface IStep<T = any> {
  /**
   * Execute the step with the provided context
   * @param context - Execution context containing page, data, credentials, etc.
   * @returns Promise resolving to step result
   */
  execute(context: ExecutionContext<T>): Promise<StepResult>;

  /**
   * Optional: Validate that the step has everything it needs before executing
   * @param context - Execution context
   * @returns true if context is valid, false otherwise
   */
  validate?(context: ExecutionContext<T>): boolean;

  /**
   * Optional: Cleanup after step execution (success or failure)
   * @param context - Execution context
   */
  cleanup?(context: ExecutionContext<T>): Promise<void>;
}

/**
 * Configuration for flow execution
 */
export type FlowExecutionConfig = {
  skipAuth?: boolean;                  // Skip authentication step
  skipNavigation?: boolean;            // Skip navigation step
  stopOnError?: boolean;               // Stop execution on first error (default: true)
  screenshotOnError?: boolean;         // Take screenshot on error (default: true)
  verbose?: boolean;                   // Verbose logging (default: false)
};

/**
 * Result of a complete flow execution
 */
export type FlowExecutionResult = {
  success: boolean;                    // Overall success
  flowKey: string;                     // Flow identifier
  leadId?: string;                     // Lead ID if applicable
  steps: StepResult[];                 // Results for each step
  totalDuration: number;               // Total execution time in ms
  error?: Error;                       // Error if flow failed
};
