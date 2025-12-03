import { z } from "zod";

export const AutomationSettingsGetSchema = z.object({
  flowKey: z.string().min(1),
});

export const AutomationSettingsSaveSchema = z.object({
  flowKey: z.string().min(1),
  headless: z.boolean().optional(),
  stopAtStep: z.string().nullable().optional(),
});

export type AutomationSettingsGetInput = z.infer<typeof AutomationSettingsGetSchema>;
export type AutomationSettingsSaveInput = z.infer<typeof AutomationSettingsSaveSchema>;
