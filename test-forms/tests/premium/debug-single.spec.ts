import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { PremiumTransformer } from '../../src/products/premium/transformer.js';
import { PremiumFormFiller } from '../helpers/premium/premiumFormFiller.js';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers les fixtures d'emails
const FIXTURES_DIR = path.resolve(__dirname, '../../../src/main/__tests__/fixtures/emails');

// Import du parser
const parserLoaderPath = path.resolve(__dirname, '../parser-loader.cjs');
let parseLead: any;

test.beforeAll(async () => {
  // Load parser dynamically (CommonJS module)
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const parserModule = require(parserLoaderPath);
  parseLead = parserModule.parseLead;
});

test('Debug single lead - email-001', async ({ page }) => {
  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type()}]`, msg.text());
  });

  // Capture errors
  page.on('pageerror', error => {
    console.error('[BROWSER ERROR]', error.message);
  });

  await page.goto('http://localhost:3100');

  // 1. Load and parse email
  const emailData = JSON.parse(readFileSync(path.join(FIXTURES_DIR, 'email-001.json'), 'utf-8'));
  const lead = parseLead(emailData.text);

  console.log('\n=== LEAD DATA ===');
  console.log('ID:', lead.id);
  console.log('Subscriber:', lead.subscriber.nom, lead.subscriber.prenom);
  console.log('Children:', lead.children?.length || 0);

  // 2. Transform with PremiumTransformer
  const transformer = new PremiumTransformer();
  const formData = transformer.transform(lead);

  console.log('\n=== FORM DATA ===');
  console.log('Profession:', formData.profession);
  console.log('Numero secu:', formData.numeroSecuriteSociale);
  console.log('Date effet:', formData.dateEffet);
  console.log('Telephone:', formData.telephone);
  console.log('Code postal:', formData.codePostal);
  console.log('Children:', formData.children?.length || 0);

  // 3. Fill form
  const formFiller = new PremiumFormFiller(page);

  console.log('\n=== STARTING FORM FILL ===');
  await formFiller.completeFullFlow(formData);

  console.log('\n=== FORM FILL COMPLETED ===');

  // Wait a bit to see what happens
  await page.waitForTimeout(5000);

  console.log('Final URL:', page.url());
});
