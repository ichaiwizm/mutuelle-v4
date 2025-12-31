/**
 * Types for the expression resolver and condition evaluator
 */

/**
 * Selector definition with optional fallback
 */
export interface SelectorDefinition {
  primary: string;
  fallback?: string;
}

/**
 * Context passed to the ExpressionResolver
 */
export interface ResolverContext {
  /** Transformed lead data ($data references) */
  transformedData?: Record<string, unknown>;

  /** CSS/XPath selectors ($selectors references) */
  selectors?: Record<string, SelectorDefinition | string>;

  /** Platform credentials ($credentials references) */
  credentials?: Record<string, string>;

  /** Flow metadata ($metadata references) */
  metadata?: Record<string, unknown>;

  /** Current loop item ($item or custom alias) */
  item?: unknown;

  /** Current loop index ($i) */
  i?: number;

  /** Custom alias for loop item (e.g., "enfant") */
  itemAlias?: string;

  /** Allow additional context properties */
  [key: string]: unknown;
}
