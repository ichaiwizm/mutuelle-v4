// Navigation helper - could be expanded later
(function() {
  // Helper function to check if user is "logged in"
  window.isUserLoggedIn = function() {
    return sessionStorage.getItem('userToken') !== null;
  };

  // Helper to get username
  window.getUsername = function() {
    return sessionStorage.getItem('username') || 'Utilisateur';
  };

  // Helper to logout
  window.logout = function() {
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('username');
    window.location.href = '/index.html';
  };
})();
