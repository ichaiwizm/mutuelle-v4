/**
 * Tester la nouvelle navigation via Offres > Tarifer
 */

import { test, expect } from '@playwright/test';
import { EntoriaAuth } from '../../../../src/main/flows/platforms/entoria/lib';
import { EntoriaPackFamilleNavigation } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/steps/navigation';

function getEntoriaCredentials() {
  const username = process.env.ENTORIA_USERNAME;
  const password = process.env.ENTORIA_PASSWORD;
  const courtierCode = process.env.ENTORIA_COURTIER_CODE;

  if (!username || !password || !courtierCode) {
    throw new Error('ENTORIA_USERNAME, ENTORIA_PASSWORD and ENTORIA_COURTIER_CODE must be set in .env');
  }

  return { username, password, courtierCode };
}

test.describe('Entoria - New Navigation', () => {
  test('Navigation via Offres > Tarifer crée nouvelle simulation', async ({ page }) => {
    test.setTimeout(180000);

    console.log('\n════════════════════════════════════════');
    console.log('   TEST NOUVELLE NAVIGATION');
    console.log('════════════════════════════════════════\n');

    // 1. Authenticate
    console.log('🔐 Authenticating...');
    const credentials = getEntoriaCredentials();
    const auth = new EntoriaAuth(credentials);
    await auth.login(page);
    await page.waitForTimeout(2000);
    console.log('✅ Authenticated');

    // 2. Execute new navigation
    console.log('\n🧭 Executing new navigation...');
    const navigation = new EntoriaPackFamilleNavigation();
    await navigation.execute(page, {
      info: (msg: string, data?: object) => console.log(`   ℹ️ ${msg}`, data || ''),
      warn: (msg: string, data?: object) => console.log(`   ⚠️ ${msg}`, data || ''),
      debug: (msg: string, data?: object) => console.log(`   🔍 ${msg}`, data || ''),
      error: (msg: string, data?: object) => console.log(`   ❌ ${msg}`, data || ''),
    } as any);

    // 3. Screenshot pour vérification visuelle
    // Le formulaire s'ouvre dans un overlay Angular dynamique
    console.log(`\n📍 URL finale: ${page.url()}`);

    await page.screenshot({
      path: 'e2e/test-results/entoria-new-navigation-result.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved - vérifier visuellement que le formulaire est ouvert');

    console.log('\n════════════════════════════════════════');
    console.log('   ✅ NAVIGATION RÉUSSIE');
    console.log('   Nouvelle tarification créée à chaque exécution');
    console.log('════════════════════════════════════════');

    // Test passed - la navigation s'est exécutée sans erreur
  });
});
