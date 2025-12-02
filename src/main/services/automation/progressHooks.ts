import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { AutomationBroadcaster } from "../automationBroadcaster";
import type { FlowHooks } from "@/main/flows/engine/types/hooks";
import type { StepProgressData } from "@/shared/types/step-progress";

/**
 * Update steps data in database
 */
async function updateItemStepsData(
  itemId: string,
  stepsData: StepProgressData
): Promise<void> {
  await db
    .update(schema.runItems)
    .set({ stepsData: JSON.stringify(stepsData) })
    .where(eq(schema.runItems.id, itemId));
}

/**
 * Create flow hooks for broadcasting and persisting step progress
 */
export function createProgressHooks(
  runId: string,
  itemId: string,
  stepsData: StepProgressData
): FlowHooks {
  return {
    beforeStep: async (context, stepDef) => {
      const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
      if (stepIndex !== -1) {
        stepsData.steps[stepIndex].status = "running";
        stepsData.steps[stepIndex].startedAt = Date.now();
        stepsData.currentStepIndex = stepIndex;

        // Broadcast and persist
        AutomationBroadcaster.stepStarted(runId, itemId, stepDef.id, stepIndex);
        await updateItemStepsData(itemId, stepsData);
      }
    },

    afterStep: async (context, stepDef, result) => {
      const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
      if (stepIndex !== -1) {
        const step = stepsData.steps[stepIndex];
        step.status = result.success ? "completed" : "failed";
        step.completedAt = Date.now();
        step.duration = result.duration;
        step.retries = result.retries;

        if (!result.success && result.error) {
          step.error = result.error.message;
        }

        // Extract screenshot path from artifacts if present
        const screenshotPath = result.metadata?.screenshotPath as string | undefined;
        if (screenshotPath) {
          step.screenshot = screenshotPath;
        }

        // Broadcast and persist
        if (result.success) {
          AutomationBroadcaster.stepCompleted(
            runId,
            itemId,
            stepDef.id,
            stepIndex,
            result.duration,
            screenshotPath
          );
        } else {
          AutomationBroadcaster.stepFailed(
            runId,
            itemId,
            stepDef.id,
            stepIndex,
            result.error?.message ?? "Unknown error",
            screenshotPath
          );
        }

        await updateItemStepsData(itemId, stepsData);
      }
    },

    onSkip: async (context, stepDef, reason) => {
      const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
      if (stepIndex !== -1) {
        stepsData.steps[stepIndex].status = "skipped";

        AutomationBroadcaster.stepSkipped(runId, itemId, stepDef.id, stepIndex, reason);
        await updateItemStepsData(itemId, stepsData);
      }
    },

    onError: async (context, error, stepDef) => {
      if (stepDef) {
        const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
        if (stepIndex !== -1) {
          stepsData.steps[stepIndex].status = "failed";
          stepsData.steps[stepIndex].error = error.message;
        }
      }
    },
  };
}
