/**
 * Utilitaires de gestion des dates pour Entoria Pack Famille
 */

/**
 * Formate une date en DD/MM/YYYY
 */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';

  // Si déjà au format DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Si format ISO ou autre
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Calcule la date d'effet (1er du mois suivant)
 */
export function getDateEffet(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const day = nextMonth.getDate().toString().padStart(2, '0');
  const month = (nextMonth.getMonth() + 1).toString().padStart(2, '0');
  const year = nextMonth.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Vérifie si une date est valide pour Entoria (>= 1er du mois en cours)
 */
export function isValidDateEffet(dateStr: string): boolean {
  // Parser DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const dateEffet = new Date(year, month, day);
  const now = new Date();
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return dateEffet >= firstOfCurrentMonth;
}
