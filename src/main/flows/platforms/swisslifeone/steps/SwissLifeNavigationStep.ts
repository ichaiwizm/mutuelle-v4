import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import type { SwissLifeNavigationStep as SwissLifeNavService } from "../products/slsis/steps/navigation";

/**
 * Navigation step for SwissLife One platform
 * Navigates to the SLSIS form and waits for iframe loading
 * Note: Iframe loading takes ~45 seconds (slow backend)
 */
export class SwissLifeNavigationStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, services } = context;

    if (!services) {
      throw new Error("Services are required for navigation");
    }

    // Cast to SwissLife navigation service to access iframe methods
    const navigationStep = services.navigation as SwissLifeNavService;

    // Execute navigation (this loads the iframe)
    await navigationStep.execute(page, context.logger);

    // Verify iframe is ready
    const isReady = await navigationStep.isFormReady(page);
    if (!isReady) {
      throw new Error("Form iframe is not ready after navigation");
    }
  }
}
