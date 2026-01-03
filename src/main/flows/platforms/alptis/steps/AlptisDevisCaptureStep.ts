/**
 * Alptis Devis Capture Step
 *
 * Captures quote data from the Alptis result page after form submission
 * and stores it in the devis database.
 */
import { BaseStep } from "../../../engine/BaseStep";
import type { ExecutionContext } from "../../../engine/types";
import type { AlptisFormData } from "../products/sante-select/transformers/types";
import { DevisService } from "../../../../services/devisService";
import type { DevisData } from "@/shared/types/devis";

/**
 * Capture devis data from Alptis result page
 */
export class AlptisDevisCaptureStep extends BaseStep<AlptisFormData> {
  protected async executeStep(context: ExecutionContext<AlptisFormData>): Promise<void> {
    const { page, lead, flowKey, services, logger, artifactsDir } = context;

    // Validate required context
    if (!lead?.id) {
      throw new Error("Lead ID is required for devis capture");
    }

    if (!services?.devisExtractor) {
      throw new Error("DevisExtractor service is not available");
    }

    const extractor = services.devisExtractor;
    logger?.info("Starting devis capture for Alptis");

    // 1. Take screenshot of result page (before extraction)
    let screenshotPath: string | undefined;
    if (artifactsDir) {
      try {
        screenshotPath = `${artifactsDir}/devis-result-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        logger?.info("Screenshot captured", { path: screenshotPath });
      } catch (error) {
        logger?.warn("Failed to capture screenshot", { error });
      }
    }

    // 2. Extract data from result page
    const extractedData = await extractor.extractDevisData(page, logger);

    if (!extractedData) {
      // Create a failed devis record
      logger?.error("Failed to extract devis data from result page");
      const { id } = await DevisService.create({
        leadId: lead.id,
        flowKey,
      });
      await DevisService.update(id, {
        status: "failed",
        errorMessage: "Failed to extract devis data from result page",
      });
      throw new Error("Failed to extract devis data from Alptis result page");
    }

    // 3. Try to download PDF (optional for Alptis)
    let pdfPath: string | undefined;
    if (extractor.downloadPdf && artifactsDir) {
      try {
        pdfPath = await extractor.downloadPdf(page, artifactsDir, logger) ?? undefined;
      } catch (error) {
        logger?.warn("Failed to download PDF", { error });
      }
    }

    // 4. Create devis record in database
    const { id: devisId } = await DevisService.create({
      leadId: lead.id,
      flowKey,
    });

    // 5. Update with extracted data
    const devisData: DevisData = {
      monthlyPremium: extractedData.monthlyPremium,
      yearlyPremium: extractedData.yearlyPremium,
      formuleName: extractedData.formuleName,
      coverageLevel: extractedData.coverageLevel,
      effectiveDate: extractedData.effectiveDate,
      devisUrl: extractedData.devisUrl,
      quoteReference: extractedData.quoteReference,
      // Add platform-specific data
      ...extractedData.platformSpecific,
    };

    await DevisService.update(devisId, {
      status: "completed",
      data: devisData,
      pdfPath: pdfPath,
    });

    logger?.info("Devis captured and saved successfully", {
      devisId,
      leadId: lead.id,
      monthlyPremium: extractedData.monthlyPremium,
      devisUrl: extractedData.devisUrl,
      quoteReference: extractedData.quoteReference,
    });
  }
}
