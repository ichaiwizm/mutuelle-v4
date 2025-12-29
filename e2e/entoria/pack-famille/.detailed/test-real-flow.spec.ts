/**
 * Test du VRAI flow Entoria - sans données hardcodées
 * Utilise le LeadTransformer pour transformer un lead réaliste
 */

import { test } from '@playwright/test';
import { EntoriaAuth } from '../../../../src/main/flows/platforms/entoria/lib';
import { EntoriaPackFamilleNavigation } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/steps/navigation';
import { FormFillOrchestrator } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/steps/form-fill/FormFillOrchestrator';
import { LeadTransformer } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/transformers/LeadTransformer';
import type { Lead } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/transformers/types';

function getEntoriaCredentials() {
  const username = process.env.ENTORIA_USERNAME;
  const password = process.env.ENTORIA_PASSWORD;
  const courtierCode = process.env.ENTORIA_COURTIER_CODE;

  if (!username || !password || !courtierCode) {
    throw new Error('ENTORIA_USERNAME, ENTORIA_PASSWORD and ENTORIA_COURTIER_CODE must be set in .env');
  }

  return { username, password, courtierCode };
}

const mockLogger = {
  info: (msg: string, data?: object) => console.log(`ℹ️ ${msg}`, data || ''),
  warn: (msg: string, data?: object) => console.log(`⚠️ ${msg}`, data || ''),
  debug: (msg: string, data?: object) => console.log(`🔍 ${msg}`, data || ''),
  error: (msg: string, data?: object) => console.log(`❌ ${msg}`, data || ''),
} as any;

// Lead RÉALISTE comme ceux d'AssurProspect - PAS de données Entoria hardcodées
const realLead: Lead = {
  id: 'test-lead-001',
  subscriber: {
    civilite: 'M.',
    nom: 'Dupont',
    prenom: 'Jean',
    dateNaissance: '1980-03-15', // Format ISO comme AssurProspect
    email: 'jean.dupont@example.com',
    telephone: '0612345678',
    adresse: '123 rue de la Paix',
    codePostal: '75001',
    ville: 'Paris',
    profession: 'Artisan', // Test avec une autre profession générique
  },
  project: {
    dateEffet: '2025-02-01',
    type: 'sante',
  },
  children: [],
};

test.describe('Entoria - REAL Flow Test', () => {
  test('Flow complet avec LeadTransformer (pas de données hardcodées)', async ({ page }) => {
    test.setTimeout(180000);

    console.log('\n════════════════════════════════════════');
    console.log('   TEST FLOW RÉEL ENTORIA');
    console.log('   (LeadTransformer + FormFill)');
    console.log('════════════════════════════════════════\n');

    // 1. TRANSFORMATION DU LEAD via LeadTransformer (code réel)
    console.log('📋 Lead original:');
    console.log(`   - Profession: "${realLead.subscriber.profession}"`);
    console.log(`   - Date naissance: "${realLead.subscriber.dateNaissance}"`);
    console.log(`   - Code postal: "${realLead.subscriber.codePostal}"`);

    console.log('\n🔄 Transformation via LeadTransformer...');
    const transformedData = LeadTransformer.transform(realLead);

    console.log('\n📋 Données transformées:');
    console.log(`   - Profession: "${transformedData.profil.profession}"`);
    console.log(`   - Date naissance: "${transformedData.profil.date_naissance}"`);
    console.log(`   - Département: "${transformedData.profil.departement_residence}"`);

    // 2. Authenticate
    console.log('\n🔐 [1/4] Authenticating...');
    const credentials = getEntoriaCredentials();
    const auth = new EntoriaAuth(credentials);
    await auth.login(page);
    await page.waitForTimeout(2000);
    console.log('✅ Authenticated\n');

    // 3. Navigate via dashboard (creates NEW tarification)
    console.log('🧭 [2/4] Navigating via dashboard...');
    const navigation = new EntoriaPackFamilleNavigation();
    await navigation.execute(page, mockLogger);
    console.log('✅ Navigation complete\n');

    // Attendre que le formulaire Angular soit complètement initialisé
    console.log('⏳ Waiting for Angular form to initialize...');
    await page.waitForTimeout(3000);

    // 4. Fill profile with TRANSFORMED data (not hardcoded)
    console.log('📝 [3/4] Filling profile with transformed data...');
    const formFill = new FormFillOrchestrator();

    try {
      await formFill.fillProfil(page, transformedData, mockLogger);
      console.log('✅ Profile filled\n');
    } catch (error) {
      console.log('❌ Error filling profile:', error);
      await page.screenshot({
        path: 'e2e/test-results/real-flow-error-profile.png',
        fullPage: true,
      });
      throw error;
    }

    // 5. Submit profile
    console.log('🚀 [4/4] Submitting profile...');
    try {
      await formFill.submitProfil(page, mockLogger);
      console.log('✅ Profile submitted - moved to step 2\n');
    } catch (error) {
      console.log('❌ Error submitting profile:', error);
      await page.screenshot({
        path: 'e2e/test-results/real-flow-error-submit.png',
        fullPage: true,
      });
      throw error;
    }

    // 6. Screenshot finale
    await page.screenshot({
      path: 'e2e/test-results/real-flow-success.png',
      fullPage: true,
    });

    console.log('════════════════════════════════════════');
    console.log('   ✅ TEST FLOW RÉEL RÉUSSI');
    console.log(`   Profession "${realLead.subscriber.profession}"`);
    console.log(`   → Transformée en "${transformedData.profil.profession}"`);
    console.log('════════════════════════════════════════');
  });
});
