/**
 * Test Journey complet - Alptis Santé Select
 * Teste le flow complet : Auth → Navigation → Sections 1-4
 * Les fixtures gèrent automatiquement les sections 1-3
 */
import { test, expect } from '../fixtures';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../helpers/credentials';
import { verifySection4Toggle, verifySection4Enfant } from '../helpers/verification';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('🎲 Random', async ({ page, formWithSection3, leadData }) => {
  // Les fixtures ont déjà fait : Auth + Nav + Sections 1-3
  expect(page.url()).toContain('/sante-select/informations-projet/');

  const step = new FormFillStep();
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

  if (hasEnfants) {
    await step.fillEnfantsToggle(page, true);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection4Toggle(page, true);

    await step.fillEnfants(page, leadData.enfants);
    expect(await step.checkForErrors(page)).toHaveLength(0);

    const lastChildIndex = leadData.enfants.length - 1;
    await verifySection4Enfant(page, leadData.enfants[lastChildIndex], lastChildIndex);
    console.log(`✅ Section 4 complétée pour ${leadData.enfants.length} enfant(s)`);
  } else {
    await verifySection4Toggle(page, false);
    console.log('⏭️ Pas d\'enfants, Section 4 ignorée');
  }
});

test('👫 Avec conjoint', async ({ page, formWithSection3, leadData }) => {
  expect(page.url()).toContain('/sante-select/informations-projet/');

  const step = new FormFillStep();
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

  if (hasEnfants) {
    await step.fillEnfantsToggle(page, true);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection4Toggle(page, true);

    await step.fillEnfants(page, leadData.enfants);
    expect(await step.checkForErrors(page)).toHaveLength(0);

    const lastChildIndex = leadData.enfants.length - 1;
    await verifySection4Enfant(page, leadData.enfants[lastChildIndex], lastChildIndex);
    console.log(`✅ Section 4 complétée pour ${leadData.enfants.length} enfant(s)`);
  } else {
    await verifySection4Toggle(page, false);
    console.log('⏭️ Pas d\'enfants, Section 4 ignorée');
  }
});

test('👶 Avec enfants', async ({ page, formWithSection3, leadData }) => {
  expect(page.url()).toContain('/sante-select/informations-projet/');

  const step = new FormFillStep();
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

  if (hasEnfants) {
    await step.fillEnfantsToggle(page, true);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection4Toggle(page, true);

    await step.fillEnfants(page, leadData.enfants);
    expect(await step.checkForErrors(page)).toHaveLength(0);

    const lastChildIndex = leadData.enfants.length - 1;
    await verifySection4Enfant(page, leadData.enfants[lastChildIndex], lastChildIndex);
    console.log(`✅ Section 4 complétée pour ${leadData.enfants.length} enfant(s)`);
  } else {
    await verifySection4Toggle(page, false);
    console.log('⏭️ Pas d\'enfants, Section 4 ignorée');
  }
});

test('👨‍👩‍👧 Conjoint + Enfants', async ({ page, formWithSection3, leadData }) => {
  expect(page.url()).toContain('/sante-select/informations-projet/');

  const step = new FormFillStep();
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

  if (hasEnfants) {
    await step.fillEnfantsToggle(page, true);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection4Toggle(page, true);

    await step.fillEnfants(page, leadData.enfants);
    expect(await step.checkForErrors(page)).toHaveLength(0);

    const lastChildIndex = leadData.enfants.length - 1;
    await verifySection4Enfant(page, leadData.enfants[lastChildIndex], lastChildIndex);
    console.log(`✅ Section 4 complétée pour ${leadData.enfants.length} enfant(s)`);
  } else {
    await verifySection4Toggle(page, false);
    console.log('⏭️ Pas d\'enfants, Section 4 ignorée');
  }
});
