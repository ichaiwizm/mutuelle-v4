import type { Provider } from './providers';

/**
 * Extrait le domaine d'une adresse email
 * Ex: "John Doe <john@example.com>" => "example.com"
 */
function extractDomain(from: string): string {
  const emailMatch = from.match(/[<\s]?([^@<>\s]+@([^>\s]+))[>\s]?/);
  if (emailMatch) {
    return emailMatch[2].toLowerCase().trim();
  }
  // Fallback: split sur @ si format simple
  const parts = from.split('@');
  if (parts.length === 2) {
    return parts[1].toLowerCase().trim();
  }
  return '';
}

/**
 * Extrait l'adresse email complète du champ "from"
 * Ex: "John Doe <john@example.com>" => "john@example.com"
 */
function extractEmail(from: string): string {
  const emailMatch = from.match(/[<\s]?([^@<>\s]+@[^>\s]+)[>\s]?/);
  if (emailMatch) {
    return emailMatch[1].toLowerCase().trim();
  }
  // Fallback: si c'est déjà une adresse simple
  if (from.includes('@')) {
    return from.toLowerCase().trim();
  }
  return '';
}

/**
 * Vérifie si un email provient d'un fournisseur autorisé
 * @param from - Champ "from" de l'email (peut contenir le nom et l'adresse)
 * @param providers - Liste des fournisseurs autorisés
 * @returns true si l'email match un fournisseur
 */
export function matchesProvider(from: string, providers: Provider[]): boolean {
  const email = extractEmail(from);
  const domain = extractDomain(from);

  for (const provider of providers) {
    // Match par adresse exacte
    if (provider.email && email === provider.email.toLowerCase()) {
      return true;
    }
    // Match par domaine
    if (provider.domain && domain === provider.domain.toLowerCase()) {
      return true;
    }
  }

  return false;
}
