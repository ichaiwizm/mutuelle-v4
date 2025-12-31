/**
 * ExpressionResolver - Resolves $variable expressions in YAML flows
 * Patterns: $data.x, $selectors.x, $credentials.x, $metadata.x, $item.x, $i
 */
import { get } from 'lodash-es';
import type { ResolverContext, SelectorDefinition } from './types.js';

const EXPRESSION_PATTERN = /\$([a-zA-Z_][a-zA-Z0-9_.]*)/g;

export class ExpressionResolver {
  constructor(private context: ResolverContext) {}

  /** Resolves all expressions in a string template */
  resolve(template: string): string {
    return template.replace(EXPRESSION_PATTERN, (match, path) => {
      const value = this.resolvePath(path);
      return value !== undefined ? String(value) : match;
    });
  }

  /** Resolves a single expression path and returns typed value */
  resolvePath(path: string): unknown {
    const [root, ...rest] = path.split('.');
    const subPath = rest.join('.');

    switch (root) {
      case 'data':
        return get(this.context.transformedData, subPath);
      case 'selectors':
        return this.resolveSelector(subPath);
      case 'credentials':
        return get(this.context.credentials, subPath);
      case 'metadata':
        return get(this.context.metadata, subPath);
      case 'i':
        return this.context.i;
      default:
        // Handle loop item reference (e.g., $enfant.dateNaissance)
        const alias = this.context.itemAlias ?? 'item';
        if (this.context.item && root === alias) {
          return subPath ? get(this.context.item, subPath) : this.context.item;
        }
        return get(this.context, path);
    }
  }

  /** Resolves selector with primary/fallback support */
  private resolveSelector(selectorPath: string): string | undefined {
    const selector = get(this.context.selectors, selectorPath) as
      | SelectorDefinition | string | undefined;
    if (!selector) return undefined;
    if (typeof selector === 'string') return selector;
    return selector.primary;
  }

  /** Creates a new resolver with loop context */
  withLoopContext(item: unknown, index: number, alias?: string): ExpressionResolver {
    return new ExpressionResolver({
      ...this.context,
      item,
      i: index,
      itemAlias: alias,
    });
  }

  /** Updates context data */
  updateContext(updates: Partial<ResolverContext>): void {
    Object.assign(this.context, updates);
  }
}
