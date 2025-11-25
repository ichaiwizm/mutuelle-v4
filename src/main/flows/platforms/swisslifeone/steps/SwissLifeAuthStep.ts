import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";

/**
 * Authentication step for SwissLife One platform
 * Logs into SwissLife One using ADFS/SAML authentication
 */
export class SwissLifeAuthStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, services } = context;

    if (!services) {
      throw new Error("Services are required for authentication");
    }

    // Execute login using injected auth service (ADFS/SAML flow)
    await services.auth.login(page, context.logger);
  }
}
