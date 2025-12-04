import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import type { AutomationSettings, AutomationSettingsInput } from "../../shared/types/automation";

export const AutomationSettingsService = {
  /**
   * Récupère les settings d'automation d'un produit
   */
  async get(flowKey: string): Promise<AutomationSettings | null> {
    const [row] = await db
      .select()
      .from(schema.productAutomationSettings)
      .where(eq(schema.productAutomationSettings.flowKey, flowKey));

    if (!row) return null;

    return {
      flowKey: row.flowKey,
      headless: row.headless,
      autoSubmit: row.autoSubmit,
      updatedAt: row.updatedAt,
    };
  },

  /**
   * Liste tous les settings d'automation
   */
  async list(): Promise<AutomationSettings[]> {
    const rows = await db.select().from(schema.productAutomationSettings);
    return rows.map((row) => ({
      flowKey: row.flowKey,
      headless: row.headless,
      autoSubmit: row.autoSubmit,
      updatedAt: row.updatedAt,
    }));
  },

  /**
   * Crée ou met à jour les settings d'un produit
   */
  async upsert(flowKey: string, settings: AutomationSettingsInput): Promise<AutomationSettings> {
    const now = new Date();

    // Merge with defaults for new records
    const headless = settings.headless ?? true;
    const autoSubmit = settings.autoSubmit ?? true;

    await db
      .insert(schema.productAutomationSettings)
      .values({
        flowKey,
        headless,
        autoSubmit,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.productAutomationSettings.flowKey,
        set: {
          ...(settings.headless !== undefined && { headless: settings.headless }),
          ...(settings.autoSubmit !== undefined && { autoSubmit: settings.autoSubmit }),
          updatedAt: now,
        },
      });

    return {
      flowKey,
      headless,
      autoSubmit,
      updatedAt: now,
    };
  },
};
