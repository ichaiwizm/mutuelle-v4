/**
 * Validation côté client avec règles strictes Premium
 */

const VALIDATION_RULES = {
  // Date d'effet minimum +7 jours
  dateEffet: {
    validate: (value) => {
      if (!value) return false;
      const date = new Date(value);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);
      return date >= minDate;
    },
    message: 'La date d\'effet doit être au minimum dans 7 jours'
  },

  // Date de naissance minimum 18 ans
  dateNaissance: {
    validate: (value) => {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;
      return actualAge >= 18;
    },
    message: 'L\'âge minimum est de 18 ans'
  },

  // Téléphone format strict
  telephone: {
    validate: (value) => {
      return /^(06|07)\.\d{2}\.\d{2}\.\d{2}\.\d{2}$/.test(value);
    },
    message: 'Le téléphone doit être au format 06.XX.XX.XX.XX ou 07.XX.XX.XX.XX'
  },

  // Code postal 5 chiffres
  codePostal: {
    validate: (value) => {
      return /^\d{5}$/.test(value);
    },
    message: 'Le code postal doit contenir 5 chiffres'
  },

  // Numéro de sécurité sociale 15 chiffres
  numeroSecuriteSociale: {
    validate: (value) => {
      return /^\d{15}$/.test(value.replace(/\s/g, ''));
    },
    message: 'Le numéro de sécurité sociale doit contenir 15 chiffres'
  }
};

/**
 * Valide un champ selon ses règles
 */
function validateField(fieldName, value) {
  const rule = VALIDATION_RULES[fieldName];
  if (!rule) return { valid: true };

  const valid = rule.validate(value);
  return {
    valid,
    message: valid ? null : rule.message
  };
}

/**
 * Affiche un message d'erreur sur un champ
 */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  // Supprimer l'ancienne erreur
  const existingError = field.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Ajouter la nouvelle erreur
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.color = '#ef4444';
  errorDiv.style.fontSize = '14px';
  errorDiv.style.marginTop = '5px';
  errorDiv.textContent = message;

  field.parentElement.appendChild(errorDiv);
  field.style.borderColor = '#ef4444';
}

/**
 * Supprime le message d'erreur d'un champ
 */
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  const errorDiv = field.parentElement.querySelector('.error-message');
  if (errorDiv) {
    errorDiv.remove();
  }

  field.style.borderColor = '';
}

/**
 * Valide tout le formulaire
 */
function validateForm() {
  let isValid = true;
  const errors = [];

  console.log('[VALIDATION] Starting form validation...');

  // Valider chaque champ avec une règle
  for (const fieldName in VALIDATION_RULES) {
    const field = document.getElementById(fieldName);
    // Only validate if field exists AND is visible (not in a hidden conditional section)
    if (field) {
      // Check if field or its parent group is hidden
      const fieldGroup = field.closest('.form-group, .delayed-field');
      const isVisible = !fieldGroup || window.getComputedStyle(fieldGroup).display !== 'none';

      console.log(`[VALIDATION] Field "${fieldName}": exists=${!!field}, visible=${isVisible}, value="${field.value}"`);

      if (isVisible) {
        const result = validateField(fieldName, field.value);
        console.log(`[VALIDATION] Field "${fieldName}" validation result:`, result);

        if (!result.valid) {
          isValid = false;
          errors.push({ field: fieldName, message: result.message });
          showFieldError(fieldName, result.message);
        } else {
          clearFieldError(fieldName);
        }
      } else {
        console.log(`[VALIDATION] Field "${fieldName}" is hidden, skipping validation`);
      }
    } else {
      console.log(`[VALIDATION] Field "${fieldName}" not found in DOM`);
    }
  }

  console.log(`[VALIDATION] Validation complete. Valid: ${isValid}, Errors:`, errors);
  return { valid: isValid, errors };
}

/**
 * Configure la validation en temps réel
 */
function setupRealtimeValidation() {
  for (const fieldName in VALIDATION_RULES) {
    const field = document.getElementById(fieldName);
    if (field) {
      field.addEventListener('blur', () => {
        const result = validateField(fieldName, field.value);
        if (!result.valid) {
          showFieldError(fieldName, result.message);
        } else {
          clearFieldError(fieldName);
        }
      });

      field.addEventListener('input', () => {
        // Effacer l'erreur pendant la saisie
        clearFieldError(fieldName);
      });
    }
  }
}

// Setup au chargement - initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupRealtimeValidation);
} else {
  setupRealtimeValidation();
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateField, validateForm, showFieldError, clearFieldError };
}

// Export vers window pour le navigateur
if (typeof window !== 'undefined') {
  window.validateField = validateField;
  window.validateForm = validateForm;
  window.showFieldError = showFieldError;
  window.clearFieldError = clearFieldError;
}
