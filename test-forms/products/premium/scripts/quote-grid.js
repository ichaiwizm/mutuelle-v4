/**
 * Gestion de la grille de sélection interactive
 */

// État de la sélection
const selection = {
  soinsMedicaux: 'Confort',
  hospitalisation: 'Confort',
  optique: 'Confort',
  dentaire: 'Confort',
  medecinesDouces: 'Confort'
};

document.addEventListener('DOMContentLoaded', () => {
  initializeGrid();
  updateTotalPrice();
});

/**
 * Initialise la grille interactive
 */
function initializeGrid() {
  const cells = document.querySelectorAll('.grid-cell');

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const category = cell.dataset.category;
      const level = cell.dataset.level;

      // Désélectionner les autres cellules de la même ligne
      const rowCells = document.querySelectorAll(`[data-category="${category}"]`);
      rowCells.forEach(c => c.classList.remove('selected'));

      // Sélectionner cette cellule
      cell.classList.add('selected');

      // Mettre à jour la sélection
      selection[category] = level;

      // Mettre à jour le prix
      updateTotalPrice();
    });
  });
}

/**
 * Calcule et affiche le prix total
 */
function updateTotalPrice() {
  let total = 0;

  const cells = document.querySelectorAll('.grid-cell.selected');
  cells.forEach(cell => {
    const price = parseFloat(cell.dataset.price);
    total += price;
  });

  const priceElement = document.getElementById('total-price');
  if (priceElement) {
    priceElement.textContent = `${total.toFixed(2)} €`;
  }
}

/**
 * Soumet la sélection
 */
function submitSelection() {
  // Calculer le prix total
  let total = 0;
  const breakdown = {};

  const cells = document.querySelectorAll('.grid-cell.selected');
  cells.forEach(cell => {
    const category = cell.dataset.category;
    const price = parseFloat(cell.dataset.price);
    breakdown[category] = price;
    total += price;
  });

  // Récupérer les données du formulaire
  const formData = getStoredFormData();

  // Créer le quote complet
  const quote = {
    id: generateQuoteId(),
    timestamp: new Date().toISOString(),
    formData,
    selection,
    price: total,
    breakdown
  };

  // Stocker le quote
  sessionStorage.setItem('premium_quote', JSON.stringify(quote));

  // Envoyer au serveur
  sendQuoteToServer(quote);

  // Rediriger vers la page de devis
  window.location.href = '/products/premium/quote.html';
}

/**
 * Génère un ID de quote unique
 */
function generateQuoteId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PREMIUM-${year}-${random}`;
}

/**
 * Envoie le quote au serveur
 */
async function sendQuoteToServer(quote) {
  try {
    const response = await fetch('/api/premium/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quote)
    });

    if (!response.ok) {
      console.error('Erreur lors de l\'envoi du quote:', response.statusText);
    }

    const result = await response.json();
    console.log('Quote envoyé avec succès:', result);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du quote:', error);
    // On continue quand même (le quote est en sessionStorage)
  }
}

/**
 * Récupère les données du formulaire depuis sessionStorage
 */
function getStoredFormData() {
  const stored = sessionStorage.getItem('premium_form_data');
  return stored ? JSON.parse(stored) : null;
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    selection,
    initializeGrid,
    updateTotalPrice,
    submitSelection,
    generateQuoteId
  };
}
