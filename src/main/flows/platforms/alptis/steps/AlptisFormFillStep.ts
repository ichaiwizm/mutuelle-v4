import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import type { AlptisFormData } from "../products/sante-select/transformers/types";
import type { FormFillOrchestrator } from "../products/sante-select/steps/form-fill/FormFillOrchestrator";

/**
 * Form fill step for Alptis platform
 * Fills form sections based on the method specified in step definition
 */
export class AlptisFormFillStep extends BaseStep<AlptisFormData> {
  protected async executeStep(context: ExecutionContext<AlptisFormData>): Promise<void> {
    const { page, transformedData, stepDefinition, services } = context;

    if (!transformedData) {
      throw new Error("Transformed data is required for form filling");
    }

    if (!services) {
      throw new Error("Services are required for form filling");
    }

    // Cast to FormFillOrchestrator to access Alptis-specific methods
    const formFiller = services.formFill as FormFillOrchestrator;

    // Call the appropriate method based on step definition
    const method = stepDefinition.method;

    switch (method) {
      case "fillMiseEnPlace":
        await formFiller.fillMiseEnPlace(page, transformedData, context.logger);
        break;

      case "fillAdherent":
        await formFiller.fillAdherent(page, transformedData, context.logger);
        break;

      case "fillConjoint":
        // First toggle, then fill if data exists
        const hasConjoint = !!transformedData.conjoint;
        await formFiller.fillConjointToggle(page, hasConjoint, context.logger);
        if (hasConjoint && transformedData.conjoint) {
          await formFiller.fillConjoint(page, transformedData.conjoint, context.logger);
        }
        break;

      case "fillEnfants":
        // First toggle, then fill if data exists
        const hasEnfants = (transformedData.enfants?.length ?? 0) > 0;
        await formFiller.fillEnfantsToggle(page, hasEnfants, context.logger);
        if (hasEnfants && transformedData.enfants) {
          await formFiller.fillEnfants(page, transformedData.enfants, context.logger);
        }
        break;

      case "submit":
        await formFiller.submit(page, context.logger);
        return; // Skip error check after submit (we're on a new page)

      default:
        throw new Error(`Unknown form fill method: ${method}`);
    }

    // Check for errors after filling
    const errors = await formFiller.checkForErrors(page, context.logger);
    if (errors && errors.length > 0) {
      throw new Error(`Form validation errors: ${errors.join(", ")}`);
    }
  }
}
