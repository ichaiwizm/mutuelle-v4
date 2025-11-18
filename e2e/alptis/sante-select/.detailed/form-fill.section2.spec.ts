import { test, expect } from '../fixtures';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../helpers/credentials';
import { verifySection2 } from '../helpers/verification';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Section 2 (après Section 1)', async ({ page, formWithSection1, leadData }: any) => {
  expect(page.url()).toContain('/sante-select/informations-projet/');

  const step = new FormFillStep();
  await step.fillAdherent(page, leadData);
  expect(await step.checkForErrors(page)).toHaveLength(0);
  await verifySection2(page, leadData);
});
