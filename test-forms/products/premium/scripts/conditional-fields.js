/**
 * Gestion des champs conditionnels
 * Les champs apparaissent/disparaissent selon d'autres champs
 */

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupConditionalFields);
} else {
  setupConditionalFields();
}

function setupConditionalFields() {
  // Code postal apparaît après avoir rempli la ville
  const villeField = document.getElementById('ville');
  if (villeField) {
    villeField.addEventListener('blur', () => {
      if (villeField.value.trim()) {
        showElementAfterDelay('codePostal-group', DELAYS.FORM_CODE_POSTAL);
      }
    });
  }

  // Régime fiscal apparaît si profession = Independant
  const professionField = document.getElementById('profession');
  if (professionField) {
    professionField.addEventListener('change', () => {
      const regimeFiscalGroup = document.getElementById('regimeFiscal-group');
      if (regimeFiscalGroup) {
        const needsRegimeFiscal = ['Independant', 'TNS', 'Artisan'].includes(professionField.value);
        regimeFiscalGroup.style.display = needsRegimeFiscal ? 'block' : 'none';

        // Rendre required si affiché
        const radios = regimeFiscalGroup.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
          if (needsRegimeFiscal) {
            radio.setAttribute('required', 'required');
          } else {
            radio.removeAttribute('required');
          }
        });
      }
    });
  }

  // Mutuelle actuelle apparaît si actuellement assuré
  const actuellementAssureCheckbox = document.getElementById('actuellementAssure');
  if (actuellementAssureCheckbox) {
    actuellementAssureCheckbox.addEventListener('change', () => {
      const mutuelleActuelleGroup = document.getElementById('mutuelleActuelle-group');
      if (mutuelleActuelleGroup) {
        mutuelleActuelleGroup.style.display = actuellementAssureCheckbox.checked ? 'block' : 'none';

        const input = document.getElementById('mutuelleActuelle');
        if (input) {
          if (actuellementAssureCheckbox.checked) {
            input.setAttribute('required', 'required');
          } else {
            input.removeAttribute('required');
          }
        }
      }
    });
  }

  // Champs conjoint apparaissent si hasConjoint
  const hasConjointCheckbox = document.getElementById('hasConjoint');
  if (hasConjointCheckbox) {
    hasConjointCheckbox.addEventListener('change', () => {
      const conjointFields = document.getElementById('conjoint-fields');
      if (conjointFields) {
        conjointFields.style.display = hasConjointCheckbox.checked ? 'block' : 'none';
      }
    });
  }

  // Gestion dynamique des enfants
  const nombreEnfantsField = document.getElementById('nombreEnfants');
  if (nombreEnfantsField) {
    nombreEnfantsField.addEventListener('change', () => {
      updateChildrenFields(parseInt(nombreEnfantsField.value) || 0);
    });
  }
}

/**
 * Met à jour les champs enfants dynamiquement
 */
function updateChildrenFields(count) {
  const container = document.getElementById('children-container');
  if (!container) return;

  // Vider le conteneur
  container.innerHTML = '';

  if (count === 0) return;

  // Créer les champs pour chaque enfant
  for (let i = 1; i <= count; i++) {
    const childDiv = document.createElement('div');
    childDiv.className = 'child-group';
    childDiv.innerHTML = `
      <h4>Enfant ${i}</h4>
      <div class="form-row">
        <div class="form-group">
          <label for="child_${i}_dateNaissance">Date de naissance</label>
          <input
            type="date"
            id="child_${i}_dateNaissance"
            name="child_${i}_dateNaissance"
            data-testid="child_${i}_dateNaissance"
            required
          />
        </div>
      </div>
    `;
    container.appendChild(childDiv);
  }
}

/**
 * Récupère toutes les données du formulaire incluant les champs conditionnels
 */
function getFormDataWithConditionals() {
  const form = document.getElementById('premium-form');
  if (!form) return null;

  const formData = new FormData(form);
  const data = {};

  // Données de base
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Ajouter les enfants
  const nombreEnfants = parseInt(data.nombreEnfants) || 0;
  if (nombreEnfants > 0) {
    data.children = [];
    for (let i = 1; i <= nombreEnfants; i++) {
      const dateNaissance = document.getElementById(`child_${i}_dateNaissance`)?.value;
      if (dateNaissance) {
        data.children.push({
          dateNaissance,
          order: i
        });
      }
    }
  }

  return data;
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupConditionalFields, updateChildrenFields, getFormDataWithConditionals };
}

// Export vers window pour le navigateur
if (typeof window !== 'undefined') {
  window.setupConditionalFields = setupConditionalFields;
  window.updateChildrenFields = updateChildrenFields;
  window.getFormDataWithConditionals = getFormDataWithConditionals;
}
