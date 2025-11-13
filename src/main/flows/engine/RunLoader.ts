import { db } from '../../db';
import { runs, runItems, leads } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { QueueItem } from '../types/QueueTypes';
import type { Lead } from '../../../shared/types';

/**
 * Loads runs and converts them to queue items.
 */
export class RunLoader {
  /**
   * Get all queued runs
   */
  async getQueuedRuns(): Promise<Array<{ id: string }>> {
    return await db.select().from(runs).where(eq(runs.status, 'queued'));
  }

  /**
   * Get all run items for a run
   */
  async getRunItems(runId: string) {
    return await db.select().from(runItems).where(eq(runItems.runId, runId));
  }

  /**
   * Convert run items to queue items
   */
  async buildQueueItems(runId: string): Promise<QueueItem[]> {
    const items = await this.getRunItems(runId);
    const queueItems: QueueItem[] = [];

    for (const item of items) {
      const lead = await this.getLeadById(item.leadId);
      if (lead) {
        queueItems.push({
          id: item.id,
          runId: item.runId,
          flowKey: item.flowKey,
          leadId: item.leadId,
          lead,
        });
      }
    }

    return queueItems;
  }

  /**
   * Get lead by ID
   */
  private async getLeadById(leadId: string): Promise<Lead | null> {
    const result = await db.select().from(leads).where(eq(leads.id, leadId));
    if (result.length === 0) return null;
    return JSON.parse(result[0].data) as Lead;
  }

  /**
   * Update run status
   */
  async updateRunStatus(runId: string, status: string): Promise<void> {
    await db.update(runs).set({ status }).where(eq(runs.id, runId));
  }
}
