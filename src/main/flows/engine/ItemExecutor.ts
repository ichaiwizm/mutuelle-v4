import { db } from '../../db';
import { runItems } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { BrowserPool } from './BrowserPool';
import { ArtifactManager } from './ArtifactManager';
import { ProductRegistry } from '../registry/ProductRegistry';
import { credentialsService } from '../../services/credentialsService';
import type { QueueItem } from '../types/QueueTypes';
import type { ProductResult } from '../types/ProductTypes';
import type { ExecutionContext } from '../types/FlowTypes';

/**
 * Executes a single queue item (runItem).
 */
export class ItemExecutor {
  private browserPool: BrowserPool;
  private registry: ProductRegistry;

  constructor() {
    this.browserPool = new BrowserPool();
    this.registry = ProductRegistry.getInstance();
  }

  /**
   * Execute a queue item
   */
  async execute(item: QueueItem, workerId: number = 0): Promise<ProductResult> {
    await this.updateStatus(item.id, 'running');
    const startTime = Date.now();

    try {
      const result = await this.executeProduct(item, workerId);
      await this.updateStatus(item.id, result.success ? 'done' : 'failed');
      return result;
    } catch (error) {
      await this.updateStatus(item.id, 'failed');
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err,
        steps: [],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute product logic
   */
  private async executeProduct(item: QueueItem, workerId: number): Promise<ProductResult> {
    const product = this.registry.get(item.flowKey);
    const creds = await this.getCredentials(product.getMetadata().platform);
    const artifacts = await this.setupArtifacts(item.id);

    await this.browserPool.initialize();
    const page = await this.browserPool.newPage(workerId);

    const context: ExecutionContext = {
      lead: item.lead,
      credentials: creds,
      page,
      artifacts,
      transformer: product['transformer'],
    };

    const result = await product.execute(context);
    await artifacts.saveResult(result);
    await this.browserPool.closeContext(workerId);

    return result;
  }

  private async getCredentials(platform: string) {
    const creds = await credentialsService.getByPlatform(platform);
    if (!creds) {
      throw new Error(`No credentials for platform ${platform}`);
    }
    return creds;
  }

  private async setupArtifacts(itemId: string): Promise<ArtifactManager> {
    const items = await db.select().from(runItems).where(eq(runItems.id, itemId));
    const artifacts = new ArtifactManager(items[0].artifactsDir);
    await artifacts.initialize();
    return artifacts;
  }

  private async updateStatus(itemId: string, status: string): Promise<void> {
    await db.update(runItems).set({ status }).where(eq(runItems.id, itemId));
  }
}
