/**
 * RepeatHandler - Handles repeat loops for collections (e.g., enfants)
 * Iterates over array data and fills repeated field sections
 */
import type { FieldDefinition } from '../types/step.js';
import { FieldFiller, type FieldFillerContext } from './field-filler.js';

export interface RepeatConfig {
  source: string;          // Data source path (e.g., $data.enfants)
  as: string;              // Alias for current item (e.g., "enfant")
  maxItems?: number;       // Maximum iterations
  toggleSelector?: string; // Toggle selector to enable section
  toggleWait?: number;     // Wait time after toggle (ms)
}

export class RepeatHandler {
  constructor(private ctx: FieldFillerContext) {}

  async handleRepeat(config: RepeatConfig, fields: FieldDefinition[]): Promise<void> {
    const sourcePath = config.source.replace(/^\$/, '');
    const items = this.ctx.resolver.resolvePath(sourcePath) as unknown[];
    if (!Array.isArray(items) || items.length === 0) return;

    const itemsToProcess = config.maxItems ? items.slice(0, config.maxItems) : items;

    if (config.toggleSelector) {
      await this.ctx.page.click(this.ctx.resolver.resolve(config.toggleSelector));
      if (config.toggleWait) await this.ctx.page.waitForTimeout(config.toggleWait);
    }

    for (let i = 0; i < itemsToProcess.length; i++) {
      const loopResolver = this.ctx.resolver.withLoopContext(itemsToProcess[i], i, config.as);
      const loopCtx: FieldFillerContext = { ...this.ctx, resolver: loopResolver };
      const loopFiller = this.createLoopFieldFiller(loopCtx);

      for (const field of fields) {
        const resolvedField = {
          ...field,
          selector: typeof field.selector === 'string' ? field.selector.replace(/\$i/g, String(i)) : field.selector,
        };
        await loopFiller.fillField(resolvedField);
      }
    }
  }

  private createLoopFieldFiller(ctx: FieldFillerContext): FieldFiller {
    return new FieldFiller(ctx);
  }
}
