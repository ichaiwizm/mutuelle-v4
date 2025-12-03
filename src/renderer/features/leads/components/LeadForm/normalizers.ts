/**
 * Normalize profession value to match dropdown options
 */
export function normalizeProfession(value?: string): string {
  if (!value) return "";
  const lower = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const mapping: Record<string, string> = {
    "profession liberale": "profession libérale",
    "chef d'entreprise": "chef d'entreprise",
    "commercant": "commerçant",
    "artisan": "artisan",
    "salarie": "salarié",
    "cadre": "cadre",
    "ouvrier": "ouvrier",
    "retraite": "retraité",
    "fonction publique": "fonction publique",
    "fonctionnaire": "fonction publique",
    "exploitant agricole": "exploitant agricole",
    "agriculteur": "exploitant agricole",
    "en recherche d'emploi": "en recherche d'emploi",
    "chomeur": "en recherche d'emploi",
    "sans activite": "sans activité",
  };

  // Find matching key
  for (const [key, val] of Object.entries(mapping)) {
    if (lower.includes(key)) return val;
  }

  // If no match found but value exists, return "autre"
  return value ? "autre" : "";
}

/**
 * Normalize regime social value to match dropdown options
 */
export function normalizeRegimeSocial(value?: string): string {
  if (!value) return "";
  const lower = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (lower.includes("tns") || lower.includes("independant") || lower.includes("travailleur")) {
    return "tns : régime des indépendants";
  }
  if (lower.includes("retraite")) {
    return "salarié (ou retraité)";
  }
  if (lower.includes("general") || lower.includes("salari")) {
    return "salarié";
  }
  if (lower.includes("alsace") || lower.includes("moselle")) {
    return "alsace";
  }
  if (lower.includes("agricole") || lower.includes("msa")) {
    return "exploitant agricole";
  }
  if (lower.includes("amexa")) {
    return "amexa";
  }

  // If no match found but value exists, return "autre"
  return value ? "autre" : "";
}
