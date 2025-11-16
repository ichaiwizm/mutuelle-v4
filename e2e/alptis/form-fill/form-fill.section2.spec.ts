import { test, expect } from '@playwright/test';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { getAlptisCredentials, hasAlptisCredentials } from '../../helpers/credentials';
import { loadAllLeads } from '../../helpers/loadLeads';
import { verifySection2 } from '../../helpers/formVerifiers';

test.describe('Alptis - Form Fill Section 2', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Remplissage et vérification de la Section 2 (email-001)', async ({ page }) => {
    const data = LeadTransformer.transform(loadAllLeads()[0]);

    const auth = new AlptisAuth(getAlptisCredentials());
    await auth.login(page);

    const nav = new NavigationStep();
    await nav.execute(page);
    expect(page.url()).toContain('/sante-select/informations-projet/');

    const step = new FormFillStep();
    await step.fillAdherent(page, data);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection2(page, data);
  });
});


