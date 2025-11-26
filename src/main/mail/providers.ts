// Configuration des fournisseurs de leads autorisés
// Permet de filtrer les emails par adresse exacte ou par domaine

export type Provider = {
  email?: string;   // Adresse email exacte (ex: "noreply@assurland.com")
  domain?: string;  // Domaine (ex: "assurprospect.com")
  name?: string;    // Nom du fournisseur (optionnel, pour documentation)
};

// Liste des fournisseurs autorisés
export const LEAD_PROVIDERS: Provider[] = [
  { domain: 'assurland.com', name: 'Assurland' }, // Accepte noreply@, opdata@, etc.
  { domain: 'assurprospect.com', name: 'AssurProspect' },
  { domain: 'france-epargne.fr', name: 'France Épargne' }, // Accepte tous les emails @france-epargne.fr
  // Ajouter d'autres fournisseurs ici
];
