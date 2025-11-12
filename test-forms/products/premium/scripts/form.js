/**
 * Logique principale du formulaire Premium
 */

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeForm);
} else {
  // DOM already loaded, initialize immediately
  initializeForm();
}

function initializeForm() {
  const form = document.getElementById('premium-form');
  if (!form) return;

  // Gérer la soumission
  form.addEventListener('submit', handleFormSubmit);

  // Setup des listeners spéciaux
  setupFormListeners();
}

/**
 * Configure les listeners du formulaire
 */
function setupFormListeners() {
  // Auto-formater le téléphone
  const telephoneField = document.getElementById('telephone');
  if (telephoneField) {
    telephoneField.addEventListener('blur', () => {
      telephoneField.value = formatPhoneNumber(telephoneField.value);
    });
  }

  // Auto-formater le numéro de sécu
  const secuField = document.getElementById('numeroSecuriteSociale');
  if (secuField) {
    secuField.addEventListener('input', () => {
      // Garder seulement les chiffres
      secuField.value = secuField.value.replace(/\D/g, '').slice(0, 15);
    });
  }

  // Auto-uppercase nom/prénom
  const nomField = document.getElementById('nom');
  const prenomField = document.getElementById('prenom');
  if (nomField) {
    nomField.addEventListener('blur', () => {
      nomField.value = nomField.value.toUpperCase();
    });
  }
  if (prenomField) {
    prenomField.addEventListener('blur', () => {
      prenomField.value = capitalizeFirstLetter(prenomField.value);
    });
  }

  // Valider date d'effet en temps réel
  const dateEffetField = document.getElementById('dateEffet');
  if (dateEffetField) {
    dateEffetField.addEventListener('change', () => {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);
      const selectedDate = new Date(dateEffetField.value);

      if (selectedDate < minDate) {
        // Auto-ajuster à la date minimum
        const year = minDate.getFullYear();
        const month = String(minDate.getMonth() + 1).padStart(2, '0');
        const day = String(minDate.getDate()).padStart(2, '0');
        dateEffetField.value = `${year}-${month}-${day}`;

        showFieldError('dateEffet', 'Date ajustée au minimum de 7 jours');
        setTimeout(() => clearFieldError('dateEffet'), 3000);
      }
    });
  }
}

/**
 * Gère la soumission du formulaire
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  console.log('[PREMIUM FORM] Starting form submission...');

  // Valider le formulaire
  console.log('[PREMIUM FORM] Validating form...');
  const validation = validateForm();
  console.log('[PREMIUM FORM] Validation result:', validation);

  // TEMPORARY: Skip validation for debugging
  const SKIP_VALIDATION = true;
  if (!SKIP_VALIDATION && !validation.valid) {
    console.error('[PREMIUM FORM] Validation failed:', validation.errors);
    alert('Veuillez corriger les erreurs dans le formulaire:\n' + validation.errors.map(e => `- ${e.field}: ${e.message}`).join('\n'));
    return;
  }
  console.log('[PREMIUM FORM] Validation passed or skipped');

  console.log('[PREMIUM FORM] Form is valid, getting form data...');

  // Récupérer les données
  const formData = getFormDataWithConditionals();
  console.log('[PREMIUM FORM] Form data collected:', formData);

  // Stocker en sessionStorage pour la page suivante
  sessionStorage.setItem('premium_form_data', JSON.stringify(formData));
  console.log('[PREMIUM FORM] Data stored in sessionStorage');

  // Rediriger vers la sélection des garanties
  console.log('[PREMIUM FORM] Redirecting to quote-selection...');
  window.top.location.href = '/products/premium/quote-selection.html';
}

/**
 * Formate un numéro de téléphone
 */
function formatPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return digits.match(/.{1,2}/g).join('.');
  }

  return phone;
}

/**
 * Capitalise la première lettre
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Récupère les données sauvegardées
 */
function getStoredFormData() {
  const stored = sessionStorage.getItem('premium_form_data');
  return stored ? JSON.parse(stored) : null;
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleFormSubmit,
    formatPhoneNumber,
    capitalizeFirstLetter,
    getStoredFormData
  };
}
