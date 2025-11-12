import { Page } from '@playwright/test';
import type { Lead } from '../../src/types.js';

/**
 * Helper class to extract quote data from the quote page
 */
export class QuoteExtractor {
  constructor(private page: Page) {}

  /**
   * Extract quote ID from the quote page
   */
  async extractQuoteId(): Promise<string> {
    const quoteIdElement = await this.page.locator('[data-testid="quote-id"]');
    return await quoteIdElement.textContent() || '';
  }

  /**
   * Extract price from quote page
   */
  async extractPrice(): Promise<number> {
    const priceText = await this.page.locator('.quote-price-amount').textContent();
    if (!priceText) return 0;

    // Extract number from "123€"
    const match = priceText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Extract all submitted data from quote page
   */
  async extractSubmittedData(): Promise<any> {
    return {
      subscriber: await this.extractSubscriberData(),
      project: await this.extractProjectData(),
      children: await this.extractChildrenData(),
    };
  }

  /**
   * Extract subscriber data
   */
  private async extractSubscriberData(): Promise<any> {
    const getText = async (testId: string) => {
      try {
        const element = this.page.locator(`[data-testid="${testId}"]`);
        return await element.textContent({ timeout: 2000 }) || '';
      } catch {
        return '';
      }
    };

    return {
      civilite: await getText('quote-civilite'),
      nom: await getText('quote-nom'),
      prenom: await getText('quote-prenom'),
      dateNaissance: await getText('quote-dateNaissance'),
      email: await getText('quote-email'),
      telephone: await getText('quote-telephone'),
    };
  }

  /**
   * Extract project data
   */
  private async extractProjectData(): Promise<any> {
    const getText = async (testId: string) => {
      try {
        const element = this.page.locator(`[data-testid="${testId}"]`);
        return await element.textContent({ timeout: 2000 }) || '';
      } catch {
        return '';
      }
    };

    const actuellementAssureText = await getText('quote-actuellementAssure');
    const soinsMedicauxText = await getText('quote-soinsMedicaux');
    const hospitalisationText = await getText('quote-hospitalisation');
    const optiqueText = await getText('quote-optique');
    const dentaireText = await getText('quote-dentaire');

    return {
      dateEffet: await getText('quote-dateEffet'),
      actuellementAssure: actuellementAssureText === 'Oui',
      soinsMedicaux: this.extractLevel(soinsMedicauxText),
      hospitalisation: this.extractLevel(hospitalisationText),
      optique: this.extractLevel(optiqueText),
      dentaire: this.extractLevel(dentaireText),
      conjoint: await this.extractConjointData(),
    };
  }

  /**
   * Extract conjoint data if present
   */
  private async extractConjointData(): Promise<any | null> {
    try {
      const dateNaissance = await this.page.locator('[data-testid="quote-conjoint-dateNaissance"]').textContent({ timeout: 2000 });
      if (!dateNaissance) return null;

      const profession = await this.page.locator('[data-testid="quote-conjoint-profession"]').textContent({ timeout: 2000 });
      const regimeSocial = await this.page.locator('[data-testid="quote-conjoint-regimeSocial"]').textContent({ timeout: 2000 });

      return {
        dateNaissance,
        profession,
        regimeSocial,
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract children data
   */
  private async extractChildrenData(): Promise<any[]> {
    const children: any[] = [];
    let index = 0;

    try {
      // First, check if there's a children section at all
      const childrenSectionExists = await this.page.locator('h3:has-text("Vos enfants")').count() > 0;
      if (!childrenSectionExists) {
        return children;
      }

      // Wait a bit for the children to be rendered
      await this.page.waitForTimeout(300);

      while (true) {
        try {
          const childLocator = this.page.locator(`[data-testid="quote-child-${index}-dateNaissance"]`);

          // Check if element exists
          const count = await childLocator.count();
          if (count === 0) break;

          const dateNaissance = await childLocator.textContent({ timeout: 2000 });
          if (!dateNaissance) break;

          children.push({
            dateNaissance,
            order: index + 1,
          });

          index++;
        } catch {
          break;
        }
      }
    } catch (error) {
      console.log(`Warning: Failed to extract children data: ${error}`);
    }

    return children;
  }

  /**
   * Extract level from "Niveau X/4" text
   */
  private extractLevel(text: string): number {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Verify that submitted data matches the original lead
   */
  async verifyDataMatch(lead: Lead): Promise<{ match: boolean; errors: string[] }> {
    const errors: string[] = [];
    const submittedData = await this.extractSubmittedData();

    // Verify subscriber data
    const subscriber = lead.subscriber as any;
    if (submittedData.subscriber.civilite !== subscriber.civilite) {
      errors.push(`Civilité mismatch: ${submittedData.subscriber.civilite} !== ${subscriber.civilite}`);
    }
    if (submittedData.subscriber.nom !== subscriber.nom) {
      errors.push(`Nom mismatch: ${submittedData.subscriber.nom} !== ${subscriber.nom}`);
    }
    if (submittedData.subscriber.prenom !== subscriber.prenom) {
      errors.push(`Prénom mismatch: ${submittedData.subscriber.prenom} !== ${subscriber.prenom}`);
    }
    if (submittedData.subscriber.dateNaissance !== subscriber.dateNaissance) {
      errors.push(`Date naissance mismatch: ${submittedData.subscriber.dateNaissance} !== ${subscriber.dateNaissance}`);
    }
    if (submittedData.subscriber.email !== subscriber.email) {
      errors.push(`Email mismatch: ${submittedData.subscriber.email} !== ${subscriber.email}`);
    }
    if (submittedData.subscriber.telephone !== subscriber.telephone) {
      errors.push(`Téléphone mismatch: ${submittedData.subscriber.telephone} !== ${subscriber.telephone}`);
    }

    // Verify project data if present
    if (lead.project) {
      const project = lead.project as any;
      if (submittedData.project.dateEffet !== project.dateEffet) {
        errors.push(`Date effet mismatch: ${submittedData.project.dateEffet} !== ${project.dateEffet}`);
      }
      if (submittedData.project.actuellementAssure !== project.actuellementAssure) {
        errors.push(`Actuellement assuré mismatch: ${submittedData.project.actuellementAssure} !== ${project.actuellementAssure}`);
      }
      if (submittedData.project.soinsMedicaux !== project.soinsMedicaux) {
        errors.push(`Soins médicaux mismatch: ${submittedData.project.soinsMedicaux} !== ${project.soinsMedicaux}`);
      }
      if (submittedData.project.hospitalisation !== project.hospitalisation) {
        errors.push(`Hospitalisation mismatch: ${submittedData.project.hospitalisation} !== ${project.hospitalisation}`);
      }
      if (submittedData.project.optique !== project.optique) {
        errors.push(`Optique mismatch: ${submittedData.project.optique} !== ${project.optique}`);
      }
      if (submittedData.project.dentaire !== project.dentaire) {
        errors.push(`Dentaire mismatch: ${submittedData.project.dentaire} !== ${project.dentaire}`);
      }

      // Verify conjoint if present
      if (project.conjoint) {
        if (!submittedData.project.conjoint) {
          errors.push('Conjoint data missing in submitted data');
        } else {
          if (submittedData.project.conjoint.dateNaissance !== project.conjoint.dateNaissance) {
            errors.push(`Conjoint date naissance mismatch: ${submittedData.project.conjoint.dateNaissance} !== ${project.conjoint.dateNaissance}`);
          }
        }
      }
    }

    // Verify children if present
    if (lead.children && lead.children.length > 0) {
      if (submittedData.children.length !== lead.children.length) {
        errors.push(`Children count mismatch: ${submittedData.children.length} !== ${lead.children.length}`);
      } else {
        for (let i = 0; i < lead.children.length; i++) {
          const leadChild = lead.children[i] as any;
          const submittedChild = submittedData.children[i];

          if (submittedChild.dateNaissance !== leadChild.dateNaissance) {
            errors.push(`Child ${i + 1} date naissance mismatch: ${submittedChild.dateNaissance} !== ${leadChild.dateNaissance}`);
          }
        }
      }
    }

    return {
      match: errors.length === 0,
      errors,
    };
  }

  /**
   * Wait for quote page to load completely
   */
  async waitForQuoteLoad() {
    await this.page.waitForSelector('[data-testid="quote-content"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }
}

/**
 * Create QuoteExtractor instance
 */
export function createQuoteExtractor(page: Page): QuoteExtractor {
  return new QuoteExtractor(page);
}
