import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import { SwissLifeOneInstances } from "../../../registry";

/**
 * Navigation step for SwissLife One platform
 * Navigates to the SLSIS form and waits for iframe loading
 * Note: Iframe loading takes ~45 seconds (slow backend)
 */
export class SwissLifeNavigationStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page } = context;

    // Get the navigation step instance from registry
    const navigationStep = SwissLifeOneInstances.getNavigationStep();

    // Execute navigation (this loads the iframe)
    await navigationStep.execute(page);

    // Verify iframe is ready
    const isReady = await navigationStep.isFormReady(page);
    if (!isReady) {
      throw new Error("Form iframe is not ready after navigation");
    }
  }
}
