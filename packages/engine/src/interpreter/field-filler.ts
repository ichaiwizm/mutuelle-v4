/**
 * FieldFiller - Handles field filling logic for various input types
 * Supports: text, date, dropdown, autocomplete, checkbox, radio
 */
import type { Page, Frame } from 'playwright';
import type { FieldDefinition } from '../types/step.js';
import type { ActionExecutor } from '../actions/index.js';
import type { ExpressionResolver } from './expression-resolver.js';

export interface FieldFillerContext {
  page: Page;
  resolver: ExpressionResolver;
  executor: ActionExecutor;
  timeout?: number;
}

export class FieldFiller {
  private context: Page | Frame;
  private timeout: number;

  constructor(private ctx: FieldFillerContext) {
    this.context = ctx.executor.getContext();
    this.timeout = ctx.timeout ?? 30000;
  }

  async fillField(field: FieldDefinition): Promise<void> {
    const selector = this.ctx.resolver.resolve(String(field.selector));
    const value = this.ctx.resolver.resolvePath(field.source.replace(/^\$/, ''));

    if (field.optional && (value === undefined || value === null || value === '')) return;
    if (field.waitFor) await this.context.waitForSelector(selector, { state: 'visible', timeout: this.timeout });

    switch (field.type) {
      case 'text': case 'email': case 'password': case 'number':
        await this.context.fill(selector, String(value ?? ''), { timeout: this.timeout }); break;
      case 'date':
        await this.context.fill(selector, '', { timeout: this.timeout });
        await this.context.fill(selector, String(value ?? ''), { timeout: this.timeout }); break;
      case 'select':
        await this.context.selectOption(selector, String(value ?? ''), { timeout: this.timeout }); break;
      case 'checkbox':
        await (value ? this.context.check(selector, { timeout: this.timeout })
          : this.context.uncheck(selector, { timeout: this.timeout })); break;
      case 'radio':
        const radioSel = selector.includes('$value') ? selector.replace('$value', String(value)) : `${selector}[value="${value}"]`;
        await this.context.check(radioSel, { timeout: this.timeout }); break;
      case 'file':
        await this.context.setInputFiles(selector, String(value ?? ''), { timeout: this.timeout }); break;
      default:
        await this.context.fill(selector, String(value ?? ''), { timeout: this.timeout });
    }
  }

  async fillAutocomplete(selector: string, value: string, optionSelector?: string): Promise<void> {
    await this.context.fill(selector, value, { timeout: this.timeout });
    await this.context.waitForTimeout(300);
    await this.context.click(optionSelector ?? `[role="option"]:has-text("${value}")`, { timeout: this.timeout });
  }
}
