import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import type { PackFamilleFormData } from "../products/pack-famille/transformers/types";
import type { FormFillOrchestrator } from "../products/pack-famille/steps/form-fill/FormFillOrchestrator";

/**
 * Form fill step for Entoria Pack Famille
 * Fills form sections based on the method specified in step definition
 */
export class EntoriaPackFamilleFormFillStep extends BaseStep<PackFamilleFormData> {
  protected async executeStep(context: ExecutionContext<PackFamilleFormData>): Promise<void> {
    const { page, transformedData, stepDefinition, services, logger } = context;

    if (!services) {
      throw new Error("Services are required for form filling");
    }

    // Cast to FormFillOrchestrator to access Entoria-specific methods
    const formFiller = services.formFill as FormFillOrchestrator;

    // Call the appropriate method based on step definition
    const method = stepDefinition.method;

    switch (method) {
      case "fillProfil":
        if (!transformedData) {
          throw new Error("Transformed data is required for fillProfil");
        }
        await formFiller.fillProfil(page, transformedData, logger);
        break;

      case "submitProfil":
        await formFiller.submitProfil(page, logger);
        break;

      case "fillBesoin":
        if (!transformedData) {
          throw new Error("Transformed data is required for fillBesoin");
        }
        await formFiller.fillBesoin(page, transformedData, logger);
        break;

      case "submitBesoin":
        await formFiller.submitBesoin(page, logger);
        break;

      case "fillGaranties":
        if (!transformedData) {
          throw new Error("Transformed data is required for fillGaranties");
        }
        await formFiller.fillGaranties(page, transformedData, logger);
        break;

      default:
        throw new Error(`Unknown form fill method: ${method}`);
    }
  }
}
