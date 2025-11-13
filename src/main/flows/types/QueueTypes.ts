import type { Lead } from '../../../shared/types';

/**
 * Queue item representing a single flow execution
 */
export interface QueueItem {
  id: string; // runItemId
  runId: string;
  flowKey: string;
  leadId: string;
  lead: Lead;
  priority?: number;
  retries?: number;
  maxRetries?: number;
}

/**
 * Worker state
 */
export interface Worker {
  id: number;
  busy: boolean;
  currentItem?: QueueItem;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  workers: {
    total: number;
    busy: number;
    idle: number;
  };
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  maxWorkers: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}
