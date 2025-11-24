import type { ProductConfiguration } from "../../../../shared/types/product";
import type { FlowLogger } from "../FlowLogger";

/**
 * Evaluates conditional rules for step execution
 */
export function evaluateConditional<T>(
  conditionalName: string,
  transformedData: T | undefined,
  productConfig: ProductConfiguration<T>,
  logger: FlowLogger
): boolean {
  if (!transformedData) {
    return false;
  }

  const rules = productConfig.conditionalRules;
  if (!rules || !rules[conditionalName]) {
    logger.warn(`Conditional rule not found: ${conditionalName}`, {
      conditionalName,
      availableRules: rules ? Object.keys(rules) : [],
    });
    return false;
  }

  return rules[conditionalName](transformedData);
}
