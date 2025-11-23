import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import { AlptisInstances } from "../../../registry";

/**
 * Navigation step for Alptis platform
 * Navigates to the appropriate form based on the flow
 */
export class AlptisNavigationStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page } = context;

    // Get the navigation step instance from registry
    const navigationStep = AlptisInstances.getNavigationStep();

    // Execute navigation
    await navigationStep.execute(page);
  }
}
