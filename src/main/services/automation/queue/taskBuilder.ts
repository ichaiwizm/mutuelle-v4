import { db, schema } from "@/main/db";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { LeadsService } from "../../leadsService";
import { AutomationSettingsService } from "../../automationSettingsService";
import { getProductConfig } from "../../productConfig/productConfigCore";
import { transformLeadForFlow, hasTransformerForFlow } from "@/main/flows/transformers";
import { artifactsRoot } from "../utils";
import { createProgressHooks } from "../progressHooks";
import type { FlowTask } from "@/main/flows/engine";
import type { StepProgressData } from "@/shared/types/step-progress";
import type { EnqueueItem } from "../types";

export type BuildTasksResult = {
  tasks: FlowTask[];
  failedCount: number;
};

/**
 * Build FlowTask[] from EnqueueItem[] with transformations and DB insertions.
 */
export async function buildTasks(
  runId: string,
  items: EnqueueItem[]
): Promise<BuildTasksResult> {
  const tasks: FlowTask[] = [];
  let failedCount = 0;

  for (const item of items) {
    const lead = await LeadsService.getById(item.leadId);
    if (!lead) {
      console.warn(`Lead ${item.leadId} not found, skipping`);
      failedCount++;
      continue;
    }

    const itemId = randomUUID();
    const dir = join(artifactsRoot(), runId, itemId);
    await mkdir(dir, { recursive: true });

    // Transform lead data for the flow (if transformer exists)
    let transformedData: unknown;
    if (hasTransformerForFlow(item.flowKey)) {
      try {
        transformedData = transformLeadForFlow(item.flowKey, lead);
      } catch (error) {
        console.log(
          `[TRANSFORM_ERROR] Lead ${item.leadId.substring(0, 8)}... | Flow: ${item.flowKey} | Error: ${error instanceof Error ? error.message : String(error)}`
        );
        // Persist a failed run item so the UI sees the failure explicitly
        await db.insert(schema.runItems).values({
          id: itemId,
          runId,
          flowKey: item.flowKey,
          leadId: item.leadId,
          status: "failed",
          artifactsDir: dir,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        failedCount++;
        continue;
      }
    }

    // Get product config to extract step definitions
    const productConfig = getProductConfig(item.flowKey);
    const stepDefs = productConfig?.steps ?? [];

    // Initialize steps data
    const stepsData: StepProgressData = {
      steps: stepDefs.map((s) => ({
        id: s.id,
        name: s.name,
        status: "pending" as const,
      })),
      totalSteps: stepDefs.length,
      currentStepIndex: 0,
    };

    // Insert run item with initial steps data
    await db.insert(schema.runItems).values({
      id: itemId,
      runId,
      flowKey: item.flowKey,
      leadId: item.leadId,
      status: "queued",
      artifactsDir: dir,
      stepsData: JSON.stringify(stepsData),
    });

    // Create hooks for this specific task
    const hooks = createProgressHooks(runId, itemId, stepsData);

    // Get automation settings for this flow
    const automationSettings = await AutomationSettingsService.get(item.flowKey);

    // In headless mode, always force autoSubmit to true
    const effectiveAutoSubmit = automationSettings?.headless !== false
      ? true
      : (automationSettings?.autoSubmit ?? true);

    tasks.push({
      id: itemId,
      flowKey: item.flowKey,
      leadId: item.leadId,
      lead,
      transformedData,
      artifactsDir: dir,
      runId,
      automationSettings: automationSettings
        ? {
            headless: automationSettings.headless,
            autoSubmit: effectiveAutoSubmit,
          }
        : undefined,
      flowConfig: {
        enablePauseResume: true,
        hooks,
        autoSubmit: effectiveAutoSubmit,
      },
    });
  }

  return { tasks, failedCount };
}
