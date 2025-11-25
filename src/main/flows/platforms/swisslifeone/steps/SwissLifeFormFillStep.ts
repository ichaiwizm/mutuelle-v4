import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import type { SwissLifeOneFormData } from "../products/slsis/transformers/types";
import type { SwissLifeNavigationStep } from "../products/slsis/steps/navigation";
import type { FormFillOrchestrator } from "../products/slsis/steps/form-fill/FormFillOrchestrator";

/**
 * Form fill step for SwissLife One platform
 * Fills form sections based on the method specified in step definition
 * Note: SwissLife One uses an iframe for the form
 */
export class SwissLifeFormFillStep extends BaseStep<SwissLifeOneFormData> {
  protected async executeStep(context: ExecutionContext<SwissLifeOneFormData>): Promise<void> {
    const { page, transformedData, stepDefinition, services } = context;

    if (!transformedData) {
      throw new Error("Transformed data is required for form filling");
    }

    if (!services) {
      throw new Error("Services are required for form filling");
    }

    // Get the navigation service to access iframe
    const nav = services.navigation as SwissLifeNavigationStep;
    const frame = await nav.getIframe(page);

    // Cast to FormFillOrchestrator to access SwissLife-specific methods
    const formFiller = services.formFill as FormFillOrchestrator;

    // Call the appropriate method based on step definition
    const method = stepDefinition.method;

    switch (method) {
      case "fillStep1Section1":
        await formFiller.fillStep1Section1(frame, transformedData, context.logger);
        break;

      case "fillStep1Section2":
        await formFiller.fillStep1Section2(frame, transformedData, context.logger);
        break;

      case "fillStep1Section3":
        await formFiller.fillStep1Section3(frame, transformedData, context.logger);
        break;

      case "fillStep1Section4":
        await formFiller.fillStep1Section4(frame, transformedData, context.logger);
        break;

      case "fillStep1Section5":
        // Section 5 handles its own conditional logic (conjoint)
        await formFiller.fillStep1Section5(frame, transformedData, context.logger);
        break;

      case "fillStep1Section6":
        // Section 6 handles its own conditional logic (enfants)
        await formFiller.fillStep1Section6(frame, transformedData, context.logger);
        break;

      case "fillStep1Section7":
        await formFiller.fillStep1Section7(frame, transformedData, context.logger);
        break;

      default:
        throw new Error(`Unknown form fill method: ${method}`);
    }

    // Note: We don't check for errors after each section for SwissLife
    // because the form validates the ENTIRE form, not individual sections.
    // Errors are checked at the end in the BulkTestRunner after all sections are filled.
  }
}
