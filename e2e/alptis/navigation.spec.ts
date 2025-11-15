import { test, expect } from '@playwright/test';
import { AlptisAuth } from '../../src/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '../../src/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { LeadTransformer } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { getAlptisCredentials, hasAlptisCredentials } from '../helpers/credentials';
import { loadAllLeads } from '../helpers/loadLeads';

/**
 * Tests de navigation et transformation de leads
 *
 * Ces tests vérifient :
 * 1. La connexion à Alptis
 * 2. La navigation vers le formulaire Santé Select
 * 3. La transformation de chaque lead (ajout chiffre random au prénom)
 */

test.describe('Alptis - Navigation et Transformation', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  // Charger tous les leads une seule fois
  const leads = loadAllLeads();

  console.log(`\n📊 Chargement de ${leads.length} leads depuis les fixtures\n`);

  // Créer un test pour chaque lead
  leads.forEach((lead, index) => {
    test(`Navigation et transformation - email-${String(index + 1).padStart(3, '0')}`, async ({ page }) => {
      const emailNumber = String(index + 1).padStart(3, '0');
      console.log(`\n📋 Test lead email-${emailNumber}`);

      // 1. Connexion
      const credentials = getAlptisCredentials();
      const auth = new AlptisAuth(credentials);
      console.log('🔐 Connexion...');
      await auth.login(page);
      console.log('✅ Connecté');

      // 2. Navigation vers formulaire
      const navigationStep = new NavigationStep();
      console.log('🧭 Navigation vers formulaire Santé Select...');
      await navigationStep.execute(page);
      console.log('✅ Sur le formulaire');

      // Vérifier l'URL
      expect(page.url()).toContain('/sante-select/informations-projet/');

      // 3. Transformation du lead
      console.log(`📝 Lead original - Prénom: "${lead.subscriber.prenom}", Nom: "${lead.subscriber.nom}"`);

      const transformedLead = LeadTransformer.transform(lead);

      console.log(`✨ Lead transformé - Prénom: "${transformedLead.subscriber.prenom}", Nom: "${transformedLead.subscriber.nom}"`);

      // Vérification que la transformation a fonctionné
      expect(transformedLead.subscriber.prenom).not.toBe(lead.subscriber.prenom);
      expect(transformedLead.subscriber.prenom).toMatch(new RegExp(`^${lead.subscriber.prenom}\\d$`));
      expect(transformedLead.subscriber.nom).toBe(lead.subscriber.nom);

      console.log(`✅ Transformation réussie pour email-${emailNumber}\n`);
    });
  });
});
