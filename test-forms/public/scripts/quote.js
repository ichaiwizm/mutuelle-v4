// Quote page logic
(function() {
  const quoteContent = document.getElementById('quote-content');

  // Extract quote ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  if (!quoteId) {
    showError('Aucun devis spécifié');
    return;
  }

  // Load quote data
  loadQuote(quoteId);

  async function loadQuote(id) {
    try {
      const response = await fetch(`/api/quotes/${id}`);
      const result = await response.json();

      if (result.success && result.quote) {
        displayQuote(result.quote);
      } else {
        showError('Devis introuvable');
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      showError('Erreur de chargement du devis');
    }
  }

  function displayQuote(quote) {
    const { id, price, data, timestamp } = quote;
    const { subscriber, project, children } = data;

    quoteContent.innerHTML = `
      <div class="quote-box">
        <!-- Price display -->
        <div class="quote-price-display">
          <h2>Votre tarif mensuel</h2>
          <div class="quote-price-amount">${price}€</div>
          <div class="quote-price-period">par mois</div>
        </div>

        <!-- Quote ID -->
        <div class="quote-section">
          <p>
            <strong>Référence du devis :</strong>
            <span class="quote-id" data-testid="quote-id">${id}</span>
          </p>
          <p><small>Généré le ${new Date(timestamp).toLocaleString('fr-FR')}</small></p>
        </div>

        <!-- Subscriber info -->
        <div class="quote-section">
          <h3>Vos informations</h3>
          <div class="quote-data-grid">
            <div class="quote-data-item">
              <span class="quote-data-label">Civilité</span>
              <span class="quote-data-value" data-testid="quote-civilite">${subscriber.civilite}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Nom</span>
              <span class="quote-data-value" data-testid="quote-nom">${subscriber.nom}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Prénom</span>
              <span class="quote-data-value" data-testid="quote-prenom">${subscriber.prenom}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Date de naissance</span>
              <span class="quote-data-value" data-testid="quote-dateNaissance">${subscriber.dateNaissance}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Email</span>
              <span class="quote-data-value" data-testid="quote-email">${subscriber.email}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Téléphone</span>
              <span class="quote-data-value" data-testid="quote-telephone">${subscriber.telephone}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Adresse</span>
              <span class="quote-data-value">${subscriber.adresse}, ${subscriber.codePostal} ${subscriber.ville}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Profession</span>
              <span class="quote-data-value">${subscriber.profession}</span>
            </div>
            <div class="quote-data-item">
              <span class="quote-data-label">Régime social</span>
              <span class="quote-data-value">${subscriber.regimeSocial}</span>
            </div>
            ${subscriber.nombreEnfants ? `
              <div class="quote-data-item">
                <span class="quote-data-label">Nombre d'enfants</span>
                <span class="quote-data-value" data-testid="quote-nombreEnfants">${subscriber.nombreEnfants}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Project info -->
        ${project ? `
          <div class="quote-section">
            <h3>Votre projet</h3>
            <div class="quote-data-grid">
              <div class="quote-data-item">
                <span class="quote-data-label">Date d'effet</span>
                <span class="quote-data-value" data-testid="quote-dateEffet">${project.dateEffet}</span>
              </div>
              <div class="quote-data-item">
                <span class="quote-data-label">Actuellement assuré</span>
                <span class="quote-data-value" data-testid="quote-actuellementAssure">${project.actuellementAssure ? 'Oui' : 'Non'}</span>
              </div>
              <div class="quote-data-item">
                <span class="quote-data-label">Soins médicaux</span>
                <span class="quote-data-value" data-testid="quote-soinsMedicaux">Niveau ${project.soinsMedicaux}/4</span>
              </div>
              <div class="quote-data-item">
                <span class="quote-data-label">Hospitalisation</span>
                <span class="quote-data-value" data-testid="quote-hospitalisation">Niveau ${project.hospitalisation}/4</span>
              </div>
              <div class="quote-data-item">
                <span class="quote-data-label">Optique</span>
                <span class="quote-data-value" data-testid="quote-optique">Niveau ${project.optique}/4</span>
              </div>
              <div class="quote-data-item">
                <span class="quote-data-label">Dentaire</span>
                <span class="quote-data-value" data-testid="quote-dentaire">Niveau ${project.dentaire}/4</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Conjoint info -->
        ${project?.conjoint ? `
          <div class="quote-section">
            <h3>Votre conjoint</h3>
            <div class="quote-data-grid">
              <div class="quote-data-item">
                <span class="quote-data-label">Date de naissance</span>
                <span class="quote-data-value" data-testid="quote-conjoint-dateNaissance">${project.conjoint.dateNaissance}</span>
              </div>
              <div class="quote-data-item">
                <span class="quote-data-label">Profession</span>
                <span class="quote-data-value" data-testid="quote-conjoint-profession">${project.conjoint.profession}</span>
              </div>
              <div class="quote-data-item">
                <span class="quote-data-label">Régime social</span>
                <span class="quote-data-value" data-testid="quote-conjoint-regimeSocial">${project.conjoint.regimeSocial}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Children info -->
        ${children && children.length > 0 ? `
          <div class="quote-section">
            <h3>Vos enfants</h3>
            <div class="quote-data-grid">
              ${children.map((child, index) => `
                <div class="quote-data-item">
                  <span class="quote-data-label">Enfant ${child.order || index + 1}</span>
                  <span class="quote-data-value" data-testid="quote-child-${index}-dateNaissance">${child.dateNaissance}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Success message -->
        <div class="success-message" data-testid="success-message">
          ✓ Votre devis a été généré avec succès
        </div>
      </div>
    `;
  }

  function showError(message) {
    quoteContent.innerHTML = `
      <div class="quote-box">
        <div class="error-message">${message}</div>
      </div>
    `;
  }
})();
