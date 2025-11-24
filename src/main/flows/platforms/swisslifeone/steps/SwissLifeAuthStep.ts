import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import { SwissLifeOneInstances } from "../../../registry";

/**
 * Authentication step for SwissLife One platform
 * Logs into SwissLife One using ADFS/SAML authentication
 */
export class SwissLifeAuthStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, credentials } = context;

    if (!credentials) {
      throw new Error("Credentials are required for authentication");
    }

    // Get the auth instance from registry
    const auth = SwissLifeOneInstances.getAuth();

    // Execute login (ADFS/SAML flow)
    await auth.login(page, context.logger);
  }
}
