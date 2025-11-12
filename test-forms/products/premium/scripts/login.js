/**
 * Logique de la page de login avec chargement progressif
 */

document.addEventListener('DOMContentLoaded', () => {
  // Afficher le champ password après 500ms
  showElementAfterDelay('password-group', DELAYS.LOGIN_PASSWORD_FIELD);

  // Afficher le bouton submit 300ms après le password (donc 800ms total)
  showElementAfterDelay('login-button', DELAYS.LOGIN_PASSWORD_FIELD + DELAYS.LOGIN_SUBMIT_BUTTON);

  // Gérer la soumission du formulaire
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }
});

/**
 * Gère la connexion
 */
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Validation simple (accepte n'importe quelles credentials pour le POC)
  if (username && password) {
    // Stocker les credentials (simplifié pour le POC)
    sessionStorage.setItem('premium_logged_in', 'true');
    sessionStorage.setItem('premium_username', username);

    // Rediriger vers la page d'accueil
    window.location.href = '/products/premium/home-wrapper.html';
  } else {
    alert('Veuillez remplir tous les champs');
  }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function isLoggedIn() {
  return sessionStorage.getItem('premium_logged_in') === 'true';
}

/**
 * Déconnexion
 */
function logout() {
  sessionStorage.removeItem('premium_logged_in');
  sessionStorage.removeItem('premium_username');
  window.location.href = '/products/premium/login.html';
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleLogin, isLoggedIn, logout };
}
