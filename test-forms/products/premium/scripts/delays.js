/**
 * Gestion des délais d'affichage des éléments
 * Simule le chargement progressif des composants
 */

// Configuration des délais (en ms)
const DELAYS = {
  LOGIN_PASSWORD_FIELD: 500,
  LOGIN_SUBMIT_BUTTON: 300,  // après le password
  HOME_NEW_QUOTE_BUTTON: 600,
  FORM_CODE_POSTAL: 400,  // après avoir rempli la ville
};

/**
 * Affiche un élément après un délai
 */
function showElementAfterDelay(elementId, delay) {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'block';
      // Trigger un événement custom pour les tests
      element.dispatchEvent(new Event('delayed-element-shown', { bubbles: true }));
    }
  }, delay);
}

/**
 * Affiche plusieurs éléments avec délais cumulatifs
 */
function showElementsProgressively(elements) {
  let cumulativeDelay = 0;

  elements.forEach(({ elementId, delay }) => {
    cumulativeDelay += delay;
    showElementAfterDelay(elementId, cumulativeDelay);
  });
}

/**
 * Attend qu'un élément soit visible (pour les tests)
 */
async function waitForElement(selector, timeout = 10000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element && element.offsetParent !== null) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`Element ${selector} not found after ${timeout}ms`);
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DELAYS, showElementAfterDelay, showElementsProgressively, waitForElement };
}
