/**
 * Mapping des valeurs enum de régime obligatoire vers les labels affichés dans l'UI
 * Utilisé pour interagir avec le composant custom dropdown via la textbox
 */
export const REGIME_LABELS: Record<string, string> = {
  ALSACE_MOSELLE: 'Alsace / Moselle',
  AMEXA: 'Amexa',
  REGIME_SALARIES_AGRICOLES: 'Régime des salariés agricoles',
  SECURITE_SOCIALE: 'Sécurité sociale',
  SECURITE_SOCIALE_INDEPENDANTS: 'Sécurité sociale des indépendants',
};

/**
 * Mapping des valeurs de cadre d'exercice vers les labels affichés dans l'UI
 */
export const CADRE_EXERCICE_LABELS: Record<string, string> = {
  SALARIE: 'Salarié',
  INDEPENDANT_PRESIDENT_SASU_SAS: 'Indépendant Président SASU/SAS',
};
