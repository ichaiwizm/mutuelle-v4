import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";

/**
 * Navigation step for Alptis platform
 * Navigates to the appropriate form based on the flow
 */
export class AlptisNavigationStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, services } = context;

    if (!services) {
      throw new Error("Services are required for navigation");
    }

    // Execute navigation using injected service
    await services.navigation.execute(page, context.logger);
  }
}
