/**
 * Test de navigation vers le formulaire SLSIS
 * Vérifie que l'iframe se charge correctement (45+ secondes)
 */
import { test, expect } from '../../fixtures';
import { hasSwissLifeOneCredentials } from '../../helpers/credentials';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

test.describe('Navigation SLSIS', () => {
  test.beforeEach(() => {
    test.setTimeout(60000); // 60s: Auth (~14s) + iframe load + marge
  });

  test('Navigation complète: Auth + Formulaire SLSIS', async ({ page, formPage }) => {
    // formPage fixture a déjà fait: auth.login() + nav.execute()

    // Vérifier qu'on est sur la bonne URL
    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    // Vérifier que l'iframe existe
    const iframe = page.frame({ name: 'iFrameTarificateur' });
    expect(iframe).not.toBeNull();

    console.log(`[TEST] Iframe URL: ${iframe!.url()}`);
    console.log(`[TEST] Iframe title: ${await iframe!.title()}`);

    // Prendre un screenshot de la page entière
    await page.screenshot({ path: 'e2e/test-results/swisslife-page-full.png', fullPage: true });

    // Prendre un screenshot de l'iframe spécifiquement
    const iframeElement = await page.locator('iframe[name="iFrameTarificateur"]');
    await iframeElement.screenshot({ path: 'e2e/test-results/swisslife-iframe.png' });

    // Vérifier qu'un champ est visible dans l'iframe (confirme que c'est chargé)
    const firstField = iframe!.locator('input[type="text"]').first();
    await expect(firstField).toBeVisible({ timeout: 5000 });

    console.log('✅ Test réussi: Formulaire SLSIS complètement chargé');
  });
});
