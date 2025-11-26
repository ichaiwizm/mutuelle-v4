import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { clickTextElement } from '../operations/TextClickOperations';
import type { TypeSimulation } from '../../../transformers/types';

/**
 * Fill "Type de simulation" field (Step 1, Section 3)
 * Selects either "Individuel" or "Pour le couple"
 */
export async function fillTypeSimulation(
  frame: Frame,
  typeSimulation: TypeSimulation,
  logger?: FlowLogger
): Promise<void> {
  const text = typeSimulation === 'INDIVIDUEL' ? 'Individuel' : 'Pour le couple';
  const exact = typeSimulation === 'INDIVIDUEL'; // Only 'Individuel' needs exact match

  await clickTextElement(frame, text, {
    fieldLabel: 'Type de simulation',
    fieldNumber: 1,
    totalFields: 1,
    exact,
  }, logger);
}

/**
 * Fill complete Section 3: Couverture santé individuelle (type de simulation only)
 */
export async function fillSection3(
  frame: Frame,
  typeSimulation: TypeSimulation,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Starting Section 3: Couverture santé individuelle');

  await fillTypeSimulation(frame, typeSimulation, logger);

  logger?.info('Section "Couverture santé individuelle" completed', { section: 'couverture_sante', fieldsCount: 1 });
}
