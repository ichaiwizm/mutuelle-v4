/**
 * Automation settings types for product configuration
 */

export type AutomationSettings = {
  flowKey: string;
  headless: boolean;
  stopAtStep: string | null;
  updatedAt: Date;
};

export type AutomationSettingsInput = {
  headless?: boolean;
  stopAtStep?: string | null;
};

export type AutomationSettingsSavePayload = {
  flowKey: string;
  headless?: boolean;
  stopAtStep?: string | null;
};
