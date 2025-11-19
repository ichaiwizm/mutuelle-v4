/**
 * Test de navigation vers le formulaire SLSIS
 * Vérifie que l'iframe se charge correctement (45+ secondes)
 */
import { test, expect } from './fixtures';
import { hasSwissLifeOneCredentials } from './helpers/credentials';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

test('Navigation complète: Auth + Formulaire SLSIS', async ({ page, formPage }) => {
  // formPage fixture a déjà fait: auth.login() + nav.execute()

  // Vérifier qu'on est sur la bonne URL
  expect(page.url()).toContain('/tarification-et-simulation/slsis');

  // Vérifier que l'iframe existe
  const iframe = page.frame({ name: 'iFrameTarificateur' });
  expect(iframe).not.toBeNull();

  // Vérifier qu'un champ est visible dans l'iframe (confirme que c'est chargé)
  const firstField = iframe!.locator('input[type="text"]').first();
  await expect(firstField).toBeVisible({ timeout: 5000 });

  console.log('✅ Test réussi: Formulaire SLSIS complètement chargé');
});

test('Vérification: Iframe se charge correctement', async ({ page, formPage }) => {
  // Récupérer l'iframe
  const iframe = page.frame({ name: 'iFrameTarificateur' });
  expect(iframe).not.toBeNull();

  // Vérifier qu'il y a au moins un input text visible
  const inputCount = await iframe!.locator('input[type="text"]').count();
  expect(inputCount).toBeGreaterThan(0);

  console.log(`✅ Iframe chargée avec ${inputCount} champs text`);
});
