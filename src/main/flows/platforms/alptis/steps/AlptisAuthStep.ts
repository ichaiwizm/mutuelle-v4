import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import { AlptisInstances } from "../../../registry";

/**
 * Authentication step for Alptis platform
 * Logs into the Alptis platform using provided credentials
 */
export class AlptisAuthStep extends BaseStep {
  protected async executeStep(context: ExecutionContext): Promise<void> {
    const { page, credentials } = context;

    if (!credentials) {
      throw new Error("Credentials are required for authentication");
    }

    // Get the auth instance from registry
    const auth = AlptisInstances.getAuth();

    // Execute login
    await auth.login(page, context.logger);
  }
}
