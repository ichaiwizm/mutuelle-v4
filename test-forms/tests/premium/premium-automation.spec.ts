import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { PremiumTransformer } from '../../src/products/premium/transformer.js';
import { PremiumFormFiller } from '../helpers/premium/premiumFormFiller.js';
import { PremiumQuoteExtractor } from '../helpers/premium/premiumQuoteExtractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers les fixtures d'emails
const FIXTURES_DIR = path.resolve(__dirname, '../../../src/main/__tests__/fixtures/emails');

// Import du parser depuis le projet principal (dynamic import pour CommonJS)
const parserLoaderPath = path.resolve(__dirname, '../parser-loader.cjs');
let parseLead: any;

/**
 * Charge une fixture d'email
 */
async function loadFixture(filename: string) {
  const { readFileSync } = await import('fs');
  const fixturePath = path.join(FIXTURES_DIR, filename);
  const content = readFileSync(fixturePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Liste des 15 emails de test
 */
const EMAIL_FIXTURES = [
  { name: 'email-001.json', description: 'Lead AssurProspect standard' },
  { name: 'email-002.json', description: 'Lead avec conjoint' },
  { name: 'email-003.json', description: 'Lead avec enfants' },
  { name: 'email-004.json', description: 'Lead profession libérale' },
  { name: 'email-005.json', description: 'Lead TNS' },
  { name: 'email-006.json', description: 'Lead retraité' },
  { name: 'email-007.json', description: 'Lead avec famille complète' },
  { name: 'email-008.json', description: 'Lead jeune actif' },
  { name: 'email-009.json', description: 'Lead senior' },
  { name: 'email-010.json', description: 'Lead artisan' },
  { name: 'email-011.json', description: 'Lead salarié' },
  { name: 'email-012.json', description: 'Lead avec plusieurs enfants' },
  { name: 'email-013.json', description: 'Lead Assurland' },
  { name: 'email-014.json', description: 'Lead avec besoins élevés' },
  { name: 'email-015.json', description: 'Lead avec besoins basiques' },
];

test.describe('Premium Product - Complete Automation Flow', () => {
  test.beforeAll(async () => {
    // Load parser dynamically (CommonJS module)
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const parserModule = require(parserLoaderPath);
    parseLead = parserModule.parseLead;
  });

  test.beforeEach(async ({ page }) => {
    // Configurer le baseURL
    await page.goto('http://localhost:3100');
  });

  for (const fixture of EMAIL_FIXTURES) {
    test(`Premium automation: ${fixture.description} (${fixture.name})`, async ({ page }) => {
      // 1. Charger et parser l'email
      const emailData = await loadFixture(fixture.name);
      const lead = parseLead(emailData.text);

      expect(lead).toBeDefined();
      expect(lead.id).toBeTruthy();

      console.log(`\n[${fixture.name}] Lead ID: ${lead.id}`);
      console.log(`[${fixture.name}] Subscriber: ${lead.subscriber.nom} ${lead.subscriber.prenom}`);

      // 2. Transformer avec PremiumTransformer (avec adaptations)
      const transformer = new PremiumTransformer();
      const formData = transformer.transform(lead);

      expect(formData).toBeDefined();
      expect(formData.nom).toBeTruthy();
      expect(formData.numeroSecuriteSociale).toBeTruthy(); // Champ Premium généré

      console.log(`[${fixture.name}] FormData profession: ${formData.profession}`);
      console.log(`[${fixture.name}] FormData numeroSecu: ${formData.numeroSecuriteSociale}`);

      // 3. Automatiser le remplissage complet
      const formFiller = new PremiumFormFiller(page);

      try {
        await formFiller.completeFullFlow(formData);
      } catch (error) {
        console.error(`[${fixture.name}] Erreur durant l'automatisation:`, error);
        throw error;
      }

      // 4. Vérifier qu'on est sur la page de quote
      await expect(page).toHaveURL(/quote\.html/);

      // 5. Extraire et vérifier le quote
      const extractor = new PremiumQuoteExtractor(page);
      const quote = await extractor.extractQuote();

      expect(quote.id).toBeTruthy();
      expect(quote.price).toBeTruthy();

      console.log(`[${fixture.name}] Quote ID: ${quote.id}`);
      console.log(`[${fixture.name}] Quote Price: ${quote.price}`);

      // 6. Vérifier la correspondance des données
      const verification = await extractor.verifyDataMatch(lead);

      if (!verification.match) {
        console.warn(`[${fixture.name}] Mismatches trouvés:`, verification.mismatches);
      }

      expect(verification.match).toBe(true);

      console.log(`[${fixture.name}] ✓ Test réussi !`);
    });
  }
});

test.describe('Premium Product - Error Handling', () => {
  test('should handle missing required fields gracefully', async ({ page }) => {
    const formFiller = new PremiumFormFiller(page);

    // Créer des données incomplètes
    const incompleteData: any = {
      civilite: 'M.',
      nom: 'TEST',
      prenom: 'User',
      // Manque beaucoup de champs requis
    };

    // Le formulaire devrait afficher des erreurs de validation
    await expect(async () => {
      await formFiller.completeFullFlow(incompleteData);
    }).rejects.toThrow();
  });

  test('should adapt invalid dates automatically', async ({ page }) => {
    const emailData = await loadFixture('email-001.json');
    const lead = parseLead(emailData.text);

    const transformer = new PremiumTransformer();
    const formData = transformer.transform(lead);

    // La date d'effet devrait être ajustée à J+7 minimum
    const dateEffet = new Date(formData.dateEffet);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 7);

    // Compare only dates (no time component)
    const dateEffetNoTime = new Date(dateEffet);
    dateEffetNoTime.setHours(0, 0, 0, 0);

    expect(dateEffetNoTime >= minDate).toBe(true);
  });
});

test.describe('Premium Product - Profession Mapping', () => {
  test('should map all profession types correctly', async ({ page }) => {
    const testProfessions = [
      { input: 'Profession libérale', expected: 'Consultant' },
      { input: 'TNS : régime des indépendants', expected: 'Independant' },
      { input: 'Salarié', expected: 'Salarie' },
      { input: 'Non renseigné', expected: 'Autre' },
    ];

    for (const { input, expected } of testProfessions) {
      const lead: any = {
        id: 'test',
        subscriber: {
          civilite: 'M.',
          nom: 'TEST',
          prenom: 'User',
          profession: input,
          // ... autres champs
        }
      };

      const transformer = new PremiumTransformer();
      const formData = transformer.transform(lead);

      expect(formData.profession).toBe(expected);
      console.log(`✓ ${input} → ${formData.profession}`);
    }
  });
});
