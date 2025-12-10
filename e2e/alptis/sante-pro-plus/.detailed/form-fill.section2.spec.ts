import { santeProPlusTest as test, expect } from '../../fixtures';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-pro-plus/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';
import { verifySection2 } from '../../helpers/verification/sante-pro-plus';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Section 2 (après Section 1)', async ({ page, formWithSection1, leadData }) => {
  expect(page.url()).toContain('/sante-pro-plus/informations-projet/');

  const step = new FormFillOrchestrator();
  await step.fillAdherent(page, leadData);
  expect(await step.checkForErrors(page)).toHaveLength(0);
  await verifySection2(page, leadData);
});
