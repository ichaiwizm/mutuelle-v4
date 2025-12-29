import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";

/**
 * Navigation step for Entoria Pack Famille
 * Navigates to the TNS Santé form after authentication
 */
export class EntoriaPackFamilleNavigationStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, services } = context;

    if (!services) {
      throw new Error("Services are required for navigation");
    }

    // Execute navigation using injected navigation service
    await services.navigation.execute(page, context.logger);
  }
}
