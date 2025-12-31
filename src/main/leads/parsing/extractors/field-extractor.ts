/**
 * Field extraction utilities
 */

const FIELD_PATTERN = /^(.+?)\s*:\s*(.+)$/;

const FIELD_NAME_MAPPING: Record<string, string> = {
  civilite: "civilite",
  nom: "nom",
  prenom: "prenom",
  adresse: "adresse",
  "code postal": "codePostal",
  ville: "ville",
  telephone: "telephone",
  email: "email",
  "date de naissance": "dateNaissance",
  profession: "profession",
  "regime social": "regimeSocial",
  "nombre d'enfants": "nombreEnfants",
  "date d'effet": "dateEffet",
  "souscripteur actuellement assure": "actuellementAssure",
  "soins medicaux": "soinsMedicaux",
  hospitalisation: "hospitalisation",
  optique: "optique",
  dentaire: "dentaire",
};

/**
 * Extracts fields from section text using "Label : Value" pattern
 */
export function extractFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = text.split("\n");

  for (const line of lines) {
    const match = line.trim().match(FIELD_PATTERN);
    if (match) {
      const [, label, value] = match;
      const normalizedKey = normalizeFieldName(label.trim());
      fields[normalizedKey] = value.trim();
    }
  }

  return fields;
}

function normalizeFieldName(label: string): string {
  const cleaned = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return FIELD_NAME_MAPPING[cleaned] || cleaned;
}
