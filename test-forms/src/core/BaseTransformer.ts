import type { Lead } from '../types.js';

/**
 * Transformer de base abstrait pour convertir Lead → FormData
 * Les transformers spécifiques (Basic, Premium) étendent cette classe
 */
export abstract class BaseTransformer<TFormData> {
  /**
   * Convertit un Lead en FormData spécifique au produit
   */
  abstract transform(lead: Lead): TFormData;

  /**
   * Convertit une date française (DD/MM/YYYY) en date HTML (YYYY-MM-DD)
   */
  protected convertDateToHtmlFormat(frenchDate: string): string {
    if (!frenchDate) return '';

    const [day, month, year] = frenchDate.split('/');

    if (!day || !month || !year) {
      throw new Error(`Invalid date format: ${frenchDate}. Expected DD/MM/YYYY`);
    }

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  /**
   * Extrait une valeur d'un objet avec gestion des undefined
   */
  protected extractValue<T>(obj: Record<string, unknown> | undefined, key: string, defaultValue: T): T {
    if (!obj) return defaultValue;
    const value = obj[key];
    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Extrait une valeur string avec gestion des undefined
   */
  protected extractString(obj: Record<string, unknown> | undefined, key: string, defaultValue: string = ''): string {
    return this.extractValue(obj, key, defaultValue);
  }

  /**
   * Extrait une valeur number avec gestion des undefined
   */
  protected extractNumber(obj: Record<string, unknown> | undefined, key: string, defaultValue: number = 0): number {
    return this.extractValue(obj, key, defaultValue);
  }

  /**
   * Extrait une valeur boolean avec gestion des undefined
   */
  protected extractBoolean(obj: Record<string, unknown> | undefined, key: string, defaultValue: boolean = false): boolean {
    return this.extractValue(obj, key, defaultValue);
  }

  /**
   * Valide que toutes les propriétés requises sont présentes
   */
  protected validateRequired(formData: TFormData, requiredFields: Array<keyof TFormData>): void {
    const missing: string[] = [];

    for (const field of requiredFields) {
      const value = formData[field];
      if (value === undefined || value === null || value === '') {
        missing.push(String(field));
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }
}
