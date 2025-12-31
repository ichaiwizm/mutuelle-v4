/**
 * Selector types with primary/fallback support for resilient element targeting
 */

/** Supported selector strategies */
export type SelectorStrategy =
  | 'css'
  | 'xpath'
  | 'text'
  | 'label'
  | 'placeholder'
  | 'testId'
  | 'role';

/** Single selector definition */
export interface SelectorDefinition {
  /** Selector strategy to use */
  strategy: SelectorStrategy;
  /** Selector value/pattern */
  value: string;
  /** Optional human-readable description */
  description?: string;
}

/** Selector with fallback chain for resilience */
export interface SelectorWithFallback {
  /** Primary selector to try first */
  primary: SelectorDefinition;
  /** Fallback selectors tried in order if primary fails */
  fallbacks?: SelectorDefinition[];
  /** Timeout in ms for each selector attempt */
  timeout?: number;
}

/** Shorthand: can be string (CSS) or full definition */
export type Selector = string | SelectorDefinition | SelectorWithFallback;

/** Frame selector for iframe targeting */
export interface FrameSelector {
  /** Selector for the frame element */
  frame: Selector;
  /** Selector within the frame */
  selector: Selector;
}

/** Resolved selector result after fallback chain */
export interface ResolvedSelector {
  /** The strategy that succeeded */
  strategy: SelectorStrategy;
  /** The value that matched */
  value: string;
  /** Index in fallback chain (0 = primary) */
  fallbackIndex: number;
  /** Time taken to resolve in ms */
  resolutionTimeMs: number;
}

/** Helper to check if selector has fallbacks */
export function hasFallbacks(selector: Selector): selector is SelectorWithFallback {
  return typeof selector === 'object' && 'primary' in selector;
}

/** Helper to normalize any selector to SelectorDefinition */
export function normalizeSelector(selector: Selector): SelectorDefinition {
  if (typeof selector === 'string') {
    return { strategy: 'css', value: selector };
  }
  if ('primary' in selector) {
    return selector.primary;
  }
  return selector;
}
