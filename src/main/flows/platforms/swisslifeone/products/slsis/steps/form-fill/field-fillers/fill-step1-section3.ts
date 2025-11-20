import type { Frame } from '@playwright/test';
import { clickTextElement } from '../operations/TextClickOperations';
import type { TypeSimulation } from '../../../transformers/types';

/**
 * Fill "Type de simulation" field (Step 1, Section 3)
 * Selects either "Individuel" or "Pour le couple"
 */
export async function fillTypeSimulation(
  frame: Frame,
  typeSimulation: TypeSimulation
): Promise<void> {
  const text = typeSimulation === 'INDIVIDUEL' ? 'Individuel' : 'Pour le couple';
  const exact = typeSimulation === 'INDIVIDUEL'; // Only 'Individuel' needs exact match

  await clickTextElement(frame, text, {
    fieldLabel: 'Type de simulation',
    fieldNumber: 1,
    totalFields: 1,
    exact,
  });
}

/**
 * Fill complete Section 3: Couverture santé individuelle (type de simulation only)
 */
export async function fillSection3(
  frame: Frame,
  typeSimulation: TypeSimulation
): Promise<void> {
  console.log('\n--- Section 3: Couverture santé individuelle ---');

  await fillTypeSimulation(frame, typeSimulation);

  console.log('✅ Section "Couverture santé individuelle" complétée (1/1 champs)');
  console.log('---\n');
}
