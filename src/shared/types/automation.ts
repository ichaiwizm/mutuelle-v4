/**
 * Automation settings types for product configuration
 */

export type AutomationSettings = {
  flowKey: string;
  headless: boolean;
  autoSubmit: boolean;  // true = soumettre, false = s'arrêter avant la soumission
  updatedAt: Date;
};

export type AutomationSettingsInput = {
  headless?: boolean;
  autoSubmit?: boolean;
};

export type AutomationSettingsSavePayload = {
  flowKey: string;
  headless?: boolean;
  autoSubmit?: boolean;
};
