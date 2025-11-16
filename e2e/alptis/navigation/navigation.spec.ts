import { test, expect } from '@playwright/test';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { getAlptisCredentials, hasAlptisCredentials } from '../../helpers/credentials';

test.describe('Alptis - Navigation vers Santé Select', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Connexion puis navigation vers le formulaire Santé Select', async ({ page }) => {
    const auth = new AlptisAuth(getAlptisCredentials());
    await auth.login(page);
    const nav = new NavigationStep();
    await nav.execute(page);
    await expect(page).toHaveURL(/\/sante-select\/informations-projet\//);
  });
});


