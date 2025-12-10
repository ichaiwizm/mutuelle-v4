import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";

/**
 * Navigation step for Alptis Santé Pro Plus
 * Navigates to the Santé Pro Plus form
 */
export class AlptisSanteProPlusNavigationStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, services } = context;

    if (!services) {
      throw new Error("Services are required for navigation");
    }

    // Execute navigation using injected service (uses Santé Pro Plus specific navigation)
    await services.navigation.execute(page, context.logger);
  }
}
