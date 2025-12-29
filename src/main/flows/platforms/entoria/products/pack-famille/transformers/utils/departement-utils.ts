/**
 * Utilitaires de gestion des départements pour Entoria Pack Famille
 */

/**
 * Extrait le département du code postal
 */
export function getDepartementFromCodePostal(codePostal: string | undefined): string {
  if (!codePostal) return '75'; // Paris par défaut

  // DOM-TOM : 3 premiers chiffres
  if (codePostal.startsWith('97') || codePostal.startsWith('98')) {
    return codePostal.substring(0, 3);
  }

  // France métropolitaine : 2 premiers chiffres
  return codePostal.substring(0, 2);
}
