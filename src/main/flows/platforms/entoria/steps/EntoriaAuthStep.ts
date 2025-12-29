import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";

/**
 * Authentication step for Entoria platform
 * Logs into the Entoria platform using provided credentials (courtierCode + username + password)
 */
export class EntoriaAuthStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, services } = context;

    if (!services) {
      throw new Error("Services are required for authentication");
    }

    // Execute login using injected auth service
    await services.auth.login(page, context.logger);
  }
}
