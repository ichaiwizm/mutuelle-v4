import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";

/**
 * Authentication step for Alptis platform
 * Logs into the Alptis platform using provided credentials
 */
export class AlptisAuthStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, services } = context;

    if (!services) {
      throw new Error("Services are required for authentication");
    }

    // Execute login using injected auth service
    await services.auth.login(page, context.logger);
  }
}
