/**
 * Affichage de la page de devis finale
 */

document.addEventListener('DOMContentLoaded', () => {
  displayQuote();
});

/**
 * Affiche les informations du devis
 */
function displayQuote() {
  const quote = getStoredQuote();
  if (!quote) {
    console.error('Aucun devis trouvé');
    return;
  }

  // Afficher l'ID
  const quoteIdElement = document.getElementById('quote-id');
  if (quoteIdElement) {
    quoteIdElement.textContent = quote.id;
  }

  // Afficher le prix
  const quotePriceElement = document.getElementById('quote-price');
  if (quotePriceElement) {
    quotePriceElement.textContent = `${quote.price.toFixed(2)} €/mois`;
  }

  // Afficher les niveaux de couverture
  if (quote.selection) {
    for (const [category, level] of Object.entries(quote.selection)) {
      const element = document.getElementById(`coverage-${category}`);
      if (element) {
        element.textContent = level;
      }
    }
  }
}

/**
 * Récupère le quote depuis sessionStorage
 */
function getStoredQuote() {
  const stored = sessionStorage.getItem('premium_quote');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Télécharge le devis (simulation)
 */
function downloadQuote() {
  const quote = getStoredQuote();
  if (!quote) {
    alert('Aucun devis à télécharger');
    return;
  }

  // Créer un blob avec les données du devis
  const content = generateQuoteText(quote);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  // Créer un lien de téléchargement
  const a = document.createElement('a');
  a.href = url;
  a.download = `devis-${quote.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert('Devis téléchargé !');
}

/**
 * Génère le contenu texte du devis
 */
function generateQuoteText(quote) {
  let text = `DEVIS PREMIUM ASSURANCE\n`;
  text += `========================\n\n`;
  text += `Référence: ${quote.id}\n`;
  text += `Date: ${new Date(quote.timestamp).toLocaleDateString('fr-FR')}\n\n`;

  text += `INFORMATIONS CLIENT\n`;
  text += `-------------------\n`;
  if (quote.formData) {
    text += `Nom: ${quote.formData.civilite} ${quote.formData.nom} ${quote.formData.prenom}\n`;
    text += `Date de naissance: ${quote.formData.dateNaissance}\n`;
    text += `Email: ${quote.formData.email}\n`;
    text += `Téléphone: ${quote.formData.telephone}\n`;
    text += `Adresse: ${quote.formData.adresse}, ${quote.formData.codePostal} ${quote.formData.ville}\n`;
    text += `Profession: ${quote.formData.profession}\n\n`;
  }

  text += `GARANTIES SÉLECTIONNÉES\n`;
  text += `-----------------------\n`;
  if (quote.selection) {
    text += `Soins médicaux: ${quote.selection.soinsMedicaux}\n`;
    text += `Hospitalisation: ${quote.selection.hospitalisation}\n`;
    text += `Optique: ${quote.selection.optique}\n`;
    text += `Dentaire: ${quote.selection.dentaire}\n`;
    text += `Médecines douces: ${quote.selection.medecinesDouces}\n\n`;
  }

  text += `TARIF\n`;
  text += `-----\n`;
  if (quote.breakdown) {
    text += `Soins médicaux: ${quote.breakdown.soinsMedicaux} €\n`;
    text += `Hospitalisation: ${quote.breakdown.hospitalisation} €\n`;
    text += `Optique: ${quote.breakdown.optique} €\n`;
    text += `Dentaire: ${quote.breakdown.dentaire} €\n`;
    text += `Médecines douces: ${quote.breakdown.medecinesDouces} €\n`;
    text += `------------------------\n`;
  }
  text += `TOTAL: ${quote.price.toFixed(2)} € / mois\n\n`;

  text += `Ce devis est valable 30 jours.\n`;

  return text;
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    displayQuote,
    downloadQuote,
    getStoredQuote,
    generateQuoteText
  };
}
