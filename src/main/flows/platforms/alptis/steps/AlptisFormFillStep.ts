import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import type { AlptisFormData } from "../products/sante-select/transformers/types";
import { AlptisInstances } from "../../../registry";

/**
 * Form fill step for Alptis platform
 * Fills form sections based on the method specified in step definition
 */
export class AlptisFormFillStep extends BaseStep<AlptisFormData> {
  protected async executeStep(context: ExecutionContext<AlptisFormData>): Promise<void> {
    const { page, transformedData, stepDefinition } = context;

    if (!transformedData) {
      throw new Error("Transformed data is required for form filling");
    }

    // Get the form fill orchestrator from registry
    const formFiller = AlptisInstances.getFormFillStep();

    // Call the appropriate method based on step definition
    const method = stepDefinition.method;

    switch (method) {
      case "fillMiseEnPlace":
        await formFiller.fillMiseEnPlace(page, transformedData);
        break;

      case "fillAdherent":
        await formFiller.fillAdherent(page, transformedData);
        break;

      case "fillConjoint":
        // First toggle, then fill if data exists
        const hasConjoint = !!transformedData.conjoint;
        await formFiller.fillConjointToggle(page, hasConjoint);
        if (hasConjoint && transformedData.conjoint) {
          await formFiller.fillConjoint(page, transformedData.conjoint);
        }
        break;

      case "fillEnfants":
        // First toggle, then fill if data exists
        const hasEnfants = (transformedData.enfants?.length ?? 0) > 0;
        await formFiller.fillEnfantsToggle(page, hasEnfants);
        if (hasEnfants && transformedData.enfants) {
          await formFiller.fillEnfants(page, transformedData.enfants);
        }
        break;

      default:
        throw new Error(`Unknown form fill method: ${method}`);
    }

    // Check for errors after filling
    const errors = await formFiller.checkForErrors(page);
    if (errors && errors.length > 0) {
      throw new Error(`Form validation errors: ${errors.join(", ")}`);
    }
  }
}
