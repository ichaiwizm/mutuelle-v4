/**
 * ConditionEvaluator - Evaluates conditional expressions in YAML flows
 * Supports: $data.x, $data.x == value, $data.x > 0, !$data.x
 */
import type { ExpressionResolver } from './expression-resolver.js';

const COMPARISON_PATTERN = /^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/;

export class ConditionEvaluator {
  constructor(private resolver: ExpressionResolver) {}

  /** Evaluates a condition string and returns boolean result */
  evaluate(condition: string): boolean {
    const trimmed = condition.trim();

    // Handle negation: !$data.isExcluded
    if (trimmed.startsWith('!')) {
      return !this.evaluate(trimmed.slice(1));
    }

    // Handle comparison: $data.x == value
    const match = trimmed.match(COMPARISON_PATTERN);
    if (match) {
      const [, left, op, right] = match;
      return this.compare(this.resolveValue(left.trim()), op, this.resolveValue(right.trim()));
    }

    // Simple boolean check: $data.hasConjoint
    return this.toBoolean(this.resolveValue(trimmed));
  }

  private compare(left: unknown, op: string, right: unknown): boolean {
    switch (op) {
      case '==': return left == right;
      case '!=': return left != right;
      case '>':  return Number(left) > Number(right);
      case '<':  return Number(left) < Number(right);
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
      default:   return false;
    }
  }

  private resolveValue(expr: string): unknown {
    if (expr.startsWith('$')) return this.resolver.resolvePath(expr.slice(1));
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    if (/^["'].*["']$/.test(expr)) return expr.slice(1, -1);
    return expr;
  }

  private toBoolean(value: unknown): boolean {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.length > 0;
    return Boolean(value);
  }
}
