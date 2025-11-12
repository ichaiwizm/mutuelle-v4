// Login page logic
(function() {
  const form = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Hide previous error
    errorMessage.style.display = 'none';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Store user token in sessionStorage
        sessionStorage.setItem('userToken', result.user.token);
        sessionStorage.setItem('username', result.user.username);

        // Redirect to home
        window.location.href = '/home.html';
      } else {
        showError('Échec de la connexion. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Une erreur est survenue. Veuillez réessayer.');
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }
})();
