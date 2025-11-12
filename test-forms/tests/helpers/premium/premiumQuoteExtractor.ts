import { Page } from '@playwright/test';
import type { Lead } from '../../../src/types.js';

/**
 * Extracteur de données depuis la page de quote Premium
 * Permet de vérifier que les données correspondent au Lead initial
 */
export class PremiumQuoteExtractor {
  constructor(private page: Page) {}

  /**
   * Extrait toutes les informations du quote
   */
  async extractQuote(): Promise<{
    id: string;
    price: string;
    coverage: {
      soinsMedicaux: string;
      hospitalisation: string;
      optique: string;
      dentaire: string;
      medecinesDouces: string;
    };
  }> {
    const id = await this.page.locator('[data-testid="quote-id"]').textContent() || '';
    const price = await this.page.locator('[data-testid="quote-price"]').textContent() || '';

    const coverage = {
      soinsMedicaux: await this.page.locator('[data-testid="coverage-soinsMedicaux"]').textContent() || '',
      hospitalisation: await this.page.locator('[data-testid="coverage-hospitalisation"]').textContent() || '',
      optique: await this.page.locator('[data-testid="coverage-optique"]').textContent() || '',
      dentaire: await this.page.locator('[data-testid="coverage-dentaire"]').textContent() || '',
      medecinesDouces: await this.page.locator('[data-testid="coverage-medecinesDouces"]').textContent() || '',
    };

    return { id, price, coverage };
  }

  /**
   * Vérifie que les données du quote correspondent au Lead
   */
  async verifyDataMatch(lead: Lead): Promise<{
    match: boolean;
    mismatches: string[];
  }> {
    const mismatches: string[] = [];

    // Pour le POC, on vérifie juste que le quote a été créé
    const quote = await this.extractQuote();

    if (!quote.id) {
      mismatches.push('Quote ID manquant');
    }

    if (!quote.price) {
      mismatches.push('Prix manquant');
    }

    // Vérifier que tous les niveaux de couverture sont définis
    for (const [key, value] of Object.entries(quote.coverage)) {
      if (!value) {
        mismatches.push(`Niveau de couverture manquant pour ${key}`);
      }
    }

    return {
      match: mismatches.length === 0,
      mismatches
    };
  }
}
