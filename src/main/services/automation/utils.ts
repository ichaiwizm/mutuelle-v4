import { join } from "node:path";
import { getUserDataDir } from "@/main/env";
import { schema } from "@/main/db";
import type { StepProgressData } from "@/shared/types/step-progress";
import type { RunItem, RunItemStatus } from "@/shared/types/run";

/**
 * Get the root directory for automation artifacts
 */
export function artifactsRoot(): string {
  return join(getUserDataDir(), "artifacts");
}

/**
 * Parse stepsData JSON from database
 */
export function parseStepsData(stepsDataJson: string | null): StepProgressData | null {
  if (!stepsDataJson) return null;
  try {
    return JSON.parse(stepsDataJson) as StepProgressData;
  } catch {
    return null;
  }
}

/**
 * Format lead name as "Prénom NOM" from subscriber data
 */
export function formatLeadName(subscriber: Record<string, unknown> | undefined): string | undefined {
  if (!subscriber) return undefined;
  const prenom = subscriber.prenom as string | undefined;
  const nom = subscriber.nom as string | undefined;
  if (!prenom && !nom) return undefined;
  const formattedPrenom = prenom || "";
  const formattedNom = nom ? nom.toUpperCase() : "";
  return `${formattedPrenom} ${formattedNom}`.trim() || undefined;
}

/**
 * Map a database row to RunItem type
 */
export function mapRunItem(
  row: typeof schema.runItems.$inferSelect,
  leadName?: string
): RunItem {
  return {
    id: row.id,
    runId: row.runId,
    flowKey: row.flowKey,
    leadId: row.leadId,
    leadName,
    status: row.status as RunItemStatus,
    artifactsDir: row.artifactsDir,
    stepsData: parseStepsData(row.stepsData ?? null),
    startedAt: row.startedAt ?? null,
    completedAt: row.completedAt ?? null,
    errorMessage: row.errorMessage ?? null,
  };
}
