import { test, expect } from '@playwright/test';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { getAlptisCredentials, hasAlptisCredentials } from '../../helpers/credentials';
import { loadAllLeads } from '../../helpers/loadLeads';
import { verifySection1 } from '../../helpers/formVerifiers';

test.describe('Alptis - Form Fill Section 1', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Remplissage et vérification de la Section 1 (email-001)', async ({ page }) => {
    const leads = loadAllLeads();
    const lead = leads[0];
    if (!lead) throw new Error('Lead introuvable pour email-001');

    const auth = new AlptisAuth(getAlptisCredentials());
    await auth.login(page);

    const nav = new NavigationStep();
    await nav.execute(page);
    expect(page.url()).toContain('/sante-select/informations-projet/');

    const data = LeadTransformer.transform(lead);
    const step = new FormFillStep();
    await step.fillMiseEnPlace(page, data);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection1(page, data);
  });
});


