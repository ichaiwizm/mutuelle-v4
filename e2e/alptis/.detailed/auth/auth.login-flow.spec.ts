import { test, expect } from '@playwright/test';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { getAlptisCredentials, hasAlptisCredentials } from '../../../helpers/credentials';

test.describe('Alptis - Login flow', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Connexion complète et sortie de la page Keycloak', async ({ page }) => {
    const auth = new AlptisAuth(getAlptisCredentials());
    await auth.login(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    expect(page.url()).not.toContain('/auth/realms/alptis-distribution/protocol/openid-connect/auth');
  });
});


