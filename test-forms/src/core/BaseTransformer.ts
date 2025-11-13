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

  /**
   * Formate un numéro de téléphone au format XX.XX.XX.XX.XX
   * Input: "0644377299" ou "06.44.37.72.99"
   * Output: "06.44.37.72.99"
   */
  protected formatPhone(phone: string): string {
    if (!phone) return '';

    // Nettoyer - retirer tous les caractères non-numériques
    const digits = phone.replace(/\D/g, '');

    // Si ce n'est pas 10 chiffres, retourner tel quel
    if (digits.length !== 10) {
      return phone;
    }

    // Formater comme XX.XX.XX.XX.XX
    return digits.match(/.{1,2}/g)?.join('.') || phone;
  }

  /**
   * Retourne la date d'effet par défaut (aujourd'hui + offsetDays jours)
   * @param offsetDays Nombre de jours à ajouter (par défaut 30)
   */
  protected getDefaultDateEffet(offsetDays: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
