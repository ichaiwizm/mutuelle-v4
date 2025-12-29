/**
 * Test single lead journey pour Entoria Pack Famille (TNS Santé)
 *
 * Ce test effectue le parcours complet de tarification :
 * 1. Authentification
 * 2. Navigation vers le formulaire
 * 3. Étape 1 : Profil
 * 4. Étape 2 : Besoin
 * 5. Étape 3 : Garanties
 */

import { test, expect } from '@playwright/test';
import { EntoriaAuth } from '../../../src/main/flows/platforms/entoria/lib';
import { FormFillOrchestrator } from '../../../src/main/flows/platforms/entoria/products/pack-famille/steps/form-fill';
import { LeadTransformer } from '../../../src/main/flows/platforms/entoria/products/pack-famille/transformers';
import { selectLeadByIndex } from '../../leads';

const FORM_URL = 'https://espacecourtier.entoria.fr/tarification/10775400299/profil/tns/sante';

function getEntoriaCredentials() {
  const username = process.env.ENTORIA_USERNAME;
  const password = process.env.ENTORIA_PASSWORD;
  const courtierCode = process.env.ENTORIA_COURTIER_CODE;

  if (!username || !password || !courtierCode) {
    throw new Error('ENTORIA_USERNAME, ENTORIA_PASSWORD and ENTORIA_COURTIER_CODE must be set in .env');
  }

  return { username, password, courtierCode };
}

test.describe('Entoria Pack Famille - Single Lead Journey', () => {
  test('Complete tarification flow with single lead', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    console.log('\n════════════════════════════════════════');
    console.log('   ENTORIA TNS SANTE - SINGLE LEAD');
    console.log('════════════════════════════════════════\n');

    // 1. Get lead data
    const leadIndex = parseInt(process.env.LEAD_INDEX || '0', 10);
    console.log(`📋 Using lead index: ${leadIndex}`);

    const lead = selectLeadByIndex(leadIndex);
    console.log('Lead ID:', lead.id);
    console.log('Lead name:', `${lead.subscriber.prenom} ${lead.subscriber.nom}`);

    // 2. Transform lead
    console.log('\n🔄 Transforming lead...');
    const formData = LeadTransformer.transform(lead);

    // 3. Authenticate
    console.log('\n🔐 Authenticating...');
    const credentials = getEntoriaCredentials();
    const auth = new EntoriaAuth(credentials);
    await auth.login(page);
    console.log('✅ Authenticated');

    // 4. Navigate to form
    console.log('\n🧭 Navigating to TNS Santé form...');
    await page.goto(FORM_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ On form page');

    // 5. Fill all steps
    console.log('\n📝 Filling form...');
    const formFill = new FormFillOrchestrator();

    // Étape 1 : Profil
    console.log('\n─── ÉTAPE 1 : PROFIL ───');
    await formFill.fillProfil(page, formData);
    await formFill.submitProfil(page);

    // Screenshot après étape 1
    await page.screenshot({
      path: 'e2e/test-results/entoria-step1-complete.png',
      fullPage: true
    });

    // Étape 2 : Besoin
    console.log('\n─── ÉTAPE 2 : BESOIN ───');
    await formFill.fillBesoin(page, formData);
    await formFill.submitBesoin(page);

    // Screenshot après étape 2
    await page.screenshot({
      path: 'e2e/test-results/entoria-step2-complete.png',
      fullPage: true
    });

    // Étape 3 : Garanties
    console.log('\n─── ÉTAPE 3 : GARANTIES ───');
    await formFill.fillGaranties(page, formData);

    // Screenshot final
    await page.screenshot({
      path: 'e2e/test-results/entoria-step3-complete.png',
      fullPage: true
    });

    console.log('\n✅ Tarification flow completed!');
    console.log('   (Stopped before submission to avoid creating real quotes)');
  });
});
