import { test, expect } from '../../fixtures';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';
import { verifySection1 } from '../../helpers/verification';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Section 1', async ({ page, formPage, leadData }) => {
  expect(page.url()).toContain('/sante-select/informations-projet/');

  const step = new FormFillStep();
  await step.fillMiseEnPlace(page, leadData);
  expect(await step.checkForErrors(page)).toHaveLength(0);
  await verifySection1(page, leadData);
});
