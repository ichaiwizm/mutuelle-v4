import { test, expect } from '../../fixtures/alptis';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';
import { verifySection1 } from '../../helpers/formVerifiers';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { getAlptisCredentials } from '../../helpers/credentials';

test.describe('Alptis - Form Fill Section 1', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Lead aléatoire', async ({ page, allLeadsData }) => {
    const leadData = allLeadsData[Math.floor(Math.random() * allLeadsData.length)];

    const auth = new AlptisAuth(getAlptisCredentials());
    await auth.login(page);

    const nav = new NavigationStep();
    await nav.execute(page);

    const formFill = new FormFillStep();
    await formFill.fillMiseEnPlace(page, leadData);

    expect(page.url()).toContain('/sante-select/informations-projet/');
    expect(await formFill.checkForErrors(page)).toHaveLength(0);
    await verifySection1(page, leadData);
  });

  test('Tous les leads', async ({ page, allLeadsData }) => {
    for (let i = 0; i < allLeadsData.length; i++) {
      const leadData = allLeadsData[i];
      console.log(`\n========== LEAD ${i + 1}/${allLeadsData.length} ==========`);

      const auth = new AlptisAuth(getAlptisCredentials());
      await auth.login(page);

      const nav = new NavigationStep();
      await nav.execute(page);

      const formFill = new FormFillStep();
      await formFill.fillMiseEnPlace(page, leadData);

      expect(page.url()).toContain('/sante-select/informations-projet/');
      expect(await formFill.checkForErrors(page)).toHaveLength(0);
      await verifySection1(page, leadData);

      console.log(`✅ Lead ${i + 1} terminé\n`);
    }
  });
});
