// Form page logic
(function() {
  const form = document.getElementById('quote-form');
  const errorMessage = document.getElementById('error-message');
  const hasConjointCheckbox = document.getElementById('hasConjoint');
  const conjointFields = document.getElementById('conjoint-fields');
  const nombreEnfantsInput = document.getElementById('nombreEnfants');
  const childrenContainer = document.getElementById('children-container');

  // Range inputs for real-time value display
  const rangeInputs = ['soinsMedicaux', 'hospitalisation', 'optique', 'dentaire'];
  rangeInputs.forEach(name => {
    const input = document.getElementById(name);
    const valueDisplay = document.getElementById(`${name}-value`);

    input.addEventListener('input', () => {
      valueDisplay.textContent = input.value;
    });
  });

  // Toggle conjoint fields
  hasConjointCheckbox.addEventListener('change', () => {
    if (hasConjointCheckbox.checked) {
      conjointFields.style.display = 'block';
      // Make conjoint fields required when visible
      document.getElementById('conjoint_dateNaissance').required = true;
      document.getElementById('conjoint_profession').required = true;
      document.getElementById('conjoint_regimeSocial').required = true;
    } else {
      conjointFields.style.display = 'none';
      // Remove required when hidden
      document.getElementById('conjoint_dateNaissance').required = false;
      document.getElementById('conjoint_profession').required = false;
      document.getElementById('conjoint_regimeSocial').required = false;
      // Clear values
      document.getElementById('conjoint_dateNaissance').value = '';
      document.getElementById('conjoint_profession').value = '';
      document.getElementById('conjoint_regimeSocial').value = '';
    }
  });

  // Update children fields when number changes
  nombreEnfantsInput.addEventListener('change', updateChildrenFields);

  function updateChildrenFields() {
    const count = parseInt(nombreEnfantsInput.value) || 0;
    childrenContainer.innerHTML = '';

    if (count === 0) return;

    for (let i = 1; i <= count; i++) {
      const childEntry = document.createElement('div');
      childEntry.className = 'child-entry';
      childEntry.dataset.testid = `child-entry-${i}`;

      childEntry.innerHTML = `
        <div class="child-entry-header">
          <h4>Enfant ${i}</h4>
        </div>
        <div class="form-group">
          <label for="child_${i}_dateNaissance">Date de naissance</label>
          <input
            type="date"
            id="child_${i}_dateNaissance"
            name="child_${i}_dateNaissance"
            data-testid="child_${i}_dateNaissance"
            required
          >
        </div>
      `;

      childrenContainer.appendChild(childEntry);
    }
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous error
    errorMessage.style.display = 'none';

    try {
      // Collect form data
      const formData = new FormData(form);
      const data = extractFormData(formData);

      console.log('Submitting quote data:', data);

      // Submit to API
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to quote page with ID
        window.location.href = `/quote.html?id=${result.quote.id}`;
      } else {
        showError(result.error || 'Échec de la soumission. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showError('Une erreur est survenue. Veuillez réessayer.');
    }
  });

  function extractFormData(formData) {
    // Build subscriber object
    const subscriber = {
      civilite: formData.get('civilite'),
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      email: formData.get('email'),
      telephone: formData.get('telephone'),
      adresse: formData.get('adresse'),
      codePostal: formData.get('codePostal'),
      ville: formData.get('ville'),
      dateNaissance: convertDateToFrench(formData.get('dateNaissance')),
      profession: formData.get('profession'),
      regimeSocial: formData.get('regimeSocial'),
    };

    // Add nombreEnfants if present
    const nombreEnfants = parseInt(formData.get('nombreEnfants')) || 0;
    if (nombreEnfants > 0) {
      subscriber.nombreEnfants = nombreEnfants;
    }

    // Build project object
    const project = {
      dateEffet: convertDateToFrench(formData.get('dateEffet')),
      actuellementAssure: formData.get('actuellementAssure') === 'on',
      soinsMedicaux: parseInt(formData.get('soinsMedicaux')),
      hospitalisation: parseInt(formData.get('hospitalisation')),
      optique: parseInt(formData.get('optique')),
      dentaire: parseInt(formData.get('dentaire')),
      source: 'manual',
    };

    // Add conjoint if present
    if (formData.get('hasConjoint') === 'on' && formData.get('conjoint_dateNaissance')) {
      project.conjoint = {
        dateNaissance: convertDateToFrench(formData.get('conjoint_dateNaissance')),
        profession: formData.get('conjoint_profession'),
        regimeSocial: formData.get('conjoint_regimeSocial'),
      };
    }

    // Build children array
    const children = [];
    for (let i = 1; i <= nombreEnfants; i++) {
      const childDate = formData.get(`child_${i}_dateNaissance`);
      if (childDate) {
        children.push({
          dateNaissance: convertDateToFrench(childDate),
          order: i,
        });
      }
    }

    // Construct final data object
    const result = {
      subscriber,
      project,
    };

    if (children.length > 0) {
      result.children = children;
    }

    return result;
  }

  function convertDateToFrench(htmlDate) {
    if (!htmlDate) return '';
    const [year, month, day] = htmlDate.split('-');
    return `${day}/${month}/${year}`;
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    // Scroll to error
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();
