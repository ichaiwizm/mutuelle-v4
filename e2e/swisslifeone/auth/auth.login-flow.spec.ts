import { test, expect } from '@playwright/test';
import { SwissLifeOneAuth } from '@/main/flows/platforms/swisslifeone/lib/SwissLifeOneAuth';
import {
  getSwissLifeOneCredentials,
  hasSwissLifeOneCredentials,
} from '../helpers/credentials';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

test('Connexion complète et arrivée sur le dashboard', async ({ page }) => {
  const auth = new SwissLifeOneAuth(getSwissLifeOneCredentials());
  await auth.login(page);

  // Vérifier qu'on est bien sur le dashboard
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  expect(page.url()).toContain('/accueil');

  // Vérifier qu'on n'est plus sur la page ADFS
  expect(page.url()).not.toContain('adfs.swisslife.fr');
});
