# Flow Automation - Mutuelle V4

Ce dossier contient l'infrastructure pour automatiser le remplissage de formulaires sur différentes plateformes d'assurance.

## 📁 Structure

```
flows/
├── README.md                    # Ce fichier
├── registry.ts                  # Registry pour instances partagées (singleton pattern)
├── config/
│   ├── index.ts                 # Barrel export
│   └── alptis.config.ts         # Configuration Alptis (timeouts, URLs, selectors)
│
└── platforms/
    └── alptis/
        ├── lib/
        │   ├── AlptisAuth.ts              # Authentification Keycloak
        │   └── cookie-interceptor.ts       # Interception bannières cookies
        │
        └── products/sante-select/
            ├── steps/
            │   ├── login/                  # (via AlptisAuth)
            │   ├── navigation/             # Navigation vers formulaire
            │   └── form-fill/              # Orchestration remplissage
            │       ├── FormFillOrchestrator.ts
            │       ├── sections/           # Section1Fill, Section2Fill, etc.
            │       ├── operations/         # DateOps, DropdownOps, ToggleOps, RadioOps
            │       ├── selectors/          # Selectors par section
            │       └── helpers/            # scroll-helpers, form-labels
            │
            └── transformers/
                ├── LeadTransformer.ts      # Transformation Lead → AlptisFormData
                ├── transformers/           # subscriber, conjoint, children, project
                ├── mappers/                # profession, regime, civilite, cadre
                └── validators/             # age, eligibility, format, lead
```

## 🎯 Plateformes Actuelles

### ✅ Alptis (Santé Select)
- **Auth**: Keycloak
- **Config**: `config/alptis.config.ts`
- **Tests E2E**: `e2e/alptis/`
- **Status**: ✅ Production ready

### 🚧 SwissLife (à venir)
- Sera ajouté selon le même pattern (avec adaptations pour iframe/composants custom)

---

## 🔧 Configuration Centralisée

Toutes les configurations sont centralisées dans `config/[platform].config.ts` pour éviter les magic numbers et strings hardcodés.

### Exemple : Alptis

**Fichier**: `config/alptis.config.ts`

```typescript
// Timeouts en millisecondes
export const AlptisTimeouts = {
  toggle: 300,
  scroll: 500,
  formFieldsAppear: 500,
  dropdownProfession: 500,
  dropdownRegime: 700,
  // ... etc
} as const;

// URLs de la plateforme
export const AlptisUrls = {
  login: 'https://pro.alptis.org/',
  santeSelectForm: 'https://pro.alptis.org/sante-select/informations-projet/',
} as const;

// Selectors CSS
export const AlptisSelectors = {
  toggle: "[class*='totem-toggle__input']",
  dateInput: "input[placeholder='Ex : 01/01/2020']",
  dropdownOption: '.totem-select-option__label',
  regimeDropdown: '#regime-obligatoire-adherent',
  // ... etc
} as const;

// Variables d'environnement
export const AlptisEnvVars = {
  username: 'ALPTIS_TEST_USERNAME',
  password: 'ALPTIS_TEST_PASSWORD',
} as const;

// Helper pour récupérer les credentials
export function getAlptisCredentials(): AlptisCredentials {
  const username = process.env[AlptisEnvVars.username];
  const password = process.env[AlptisEnvVars.password];

  if (!username || !password) {
    throw new Error('Missing Alptis credentials in environment');
  }

  return { username, password };
}
```

### Utilisation dans le Code

**⚠️ IMPORTANT**: Utilisez des **chemins relatifs**, pas les path aliases TypeScript (`@/...`) car Playwright ne les résout pas au runtime.

```typescript
// ✅ CORRECT - Chemin relatif
import { AlptisTimeouts, AlptisSelectors } from '../../../../../../../config';

// ❌ INCORRECT - Path alias (ne fonctionne pas avec Playwright)
import { AlptisTimeouts, AlptisSelectors } from '@/main/flows/config';

// Utilisation
await page.waitForTimeout(AlptisTimeouts.dropdownProfession);
const dateInput = page.locator(AlptisSelectors.dateInput);
```

**Astuce**: Utilisez `realpath --relative-to` pour calculer le bon chemin:
```bash
realpath --relative-to="src/main/flows/platforms/alptis/lib" "src/main/flows/config"
# Output: ../../../config
```

### Variables d'Environnement

**Fichier**: `.env` (à la racine du projet)

```bash
# Alptis
ALPTIS_TEST_USERNAME=your-username
ALPTIS_TEST_PASSWORD=your-password
ALPTIS_DEBUG_COOKIES=1  # Optionnel : debug interception cookies

# Tests
LEAD_INDEX=5            # Optionnel : sélectionner un lead spécifique pour les tests
```

---

## 📦 Registry (Instances Partagées)

Le registry implémente un **pattern Singleton** pour partager des instances entre les tests et éviter de recréer les objets à chaque fois.

### 🎯 Pourquoi un Registry ?

**Problème sans registry** :
```typescript
// ❌ Crée 3 nouvelles instances à chaque test
test('test 1', async ({ page }) => {
  const auth = new AlptisAuth(getAlptisCredentials());  // Instance 1
  await auth.login(page);
});

test('test 2', async ({ page }) => {
  const auth = new AlptisAuth(getAlptisCredentials());  // Instance 2 (nouvelle)
  await auth.login(page);
});
```

**Solution avec registry** :
```typescript
// ✅ Réutilise la même instance
test('test 1', async ({ page }) => {
  const auth = AlptisInstances.getAuth();  // Instance partagée
  await auth.login(page);
});

test('test 2', async ({ page }) => {
  const auth = AlptisInstances.getAuth();  // Même instance
  await auth.login(page);
});
```

### 🔍 Fonctionnement Interne

**Fichier**: `registry.ts`

```typescript
/**
 * Registry générique pour gérer les instances partagées (Singleton pattern)
 */
class FlowRegistry {
  private instances = new Map<string, any>();

  /**
   * Récupère une instance depuis le cache, ou la crée via factory si elle n'existe pas
   * @param key - Clé unique pour identifier l'instance
   * @param factory - Fonction qui crée l'instance si elle n'existe pas
   */
  get<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }

  /**
   * Supprime une instance du cache
   */
  reset(key: string): void {
    this.instances.delete(key);
  }

  /**
   * Vide tout le cache
   */
  resetAll(): void {
    this.instances.clear();
  }
}

// Instance unique du registry (singleton)
const registry = new FlowRegistry();

/**
 * Namespace pour les instances Alptis
 * Chaque plateforme a son propre namespace (AlptisInstances, SwissLifeInstances, etc.)
 */
export const AlptisInstances = {
  /**
   * Récupère l'instance d'authentification Alptis
   * Créée une seule fois, réutilisée ensuite
   */
  getAuth: () => registry.get('alptis-auth', () =>
    new AlptisAuth(getAlptisCredentials())
  ),

  /**
   * Récupère l'instance de navigation
   */
  getNavigationStep: () => registry.get('alptis-navigation', () =>
    new NavigationStep()
  ),

  /**
   * Récupère l'instance du FormFillOrchestrator
   */
  getFormFillStep: () => registry.get('alptis-form-fill', () =>
    new FormFillOrchestrator()
  ),

  /**
   * Réinitialise toutes les instances Alptis
   * Utile pour forcer la recréation (tests isolés, etc.)
   */
  reset: () => {
    registry.reset('alptis-auth');
    registry.reset('alptis-navigation');
    registry.reset('alptis-form-fill');
  },
};
```

### 📖 Utilisation du Registry

#### Dans les Tests E2E

```typescript
import { AlptisInstances } from '../../src/main/flows/registry';

// Récupérer les instances
const auth = AlptisInstances.getAuth();
await auth.login(page);

const nav = AlptisInstances.getNavigationStep();
await nav.execute(page);

const formFill = AlptisInstances.getFormFillStep();
await formFill.fillMiseEnPlace(page, formData);
```

#### Dans les Fixtures Playwright

```typescript
export const test = base.extend<AlptisFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const auth = AlptisInstances.getAuth();  // Instance partagée
    await auth.login(page);
    await use();
  },

  formPage: async ({ page, authenticatedPage }, use) => {
    const nav = AlptisInstances.getNavigationStep();  // Instance partagée
    await nav.execute(page);
    await use();
  },
});
```

#### Réinitialisation

```typescript
// Réinitialiser toutes les instances Alptis
// (rare, seulement si vous voulez forcer la recréation)
AlptisInstances.reset();

// Après reset, getAuth() créera une nouvelle instance
const auth = AlptisInstances.getAuth();  // Nouvelle instance
```

---

## 🧪 Tests E2E avec Playwright

### 📁 Structure des Tests

```
e2e/alptis/
├── fixtures.ts                          # Fixtures réutilisables (auth, nav, form)
├── types.ts                             # Types pour les tests
├── helpers/
│   ├── credentials.ts                   # Gestion credentials
│   ├── loadLeads.ts                     # Chargement leads depuis JSON
│   ├── leadSelector.ts                  # Sélection leads par type
│   └── transformerVerifiers.ts          # Vérifications transformation
│
├── auth/                                # Tests d'authentification
│   ├── auth.login-flow.spec.ts
│   ├── auth.loginstep-ui.spec.ts
│   └── auth.selectors-stability.spec.ts
│
└── sante-select/
    ├── journey.spec.ts                  # Tests parcours complets
    ├── single-lead-journey.spec.ts      # Test un lead spécifique
    ├── bulk-validation.spec.ts          # Validation en masse
    └── .detailed/                       # Tests détaillés par section
        ├── navigation.spec.ts
        ├── transformer.spec.ts
        ├── form-fill.section1.spec.ts
        ├── form-fill.section2.spec.ts
        ├── form-fill.section3.spec.ts
        ├── form-fill.section4.spec.ts
        └── error-handling.invalid-data.spec.ts
```

### 🎭 Fixtures Playwright

Les fixtures permettent de **réutiliser du setup** entre les tests. Elles sont composables et créent une chaîne de dépendances.

**Fichier**: `e2e/alptis/fixtures.ts`

```typescript
import { test as base } from '@playwright/test';
import { AlptisInstances } from '../../src/main/flows/registry';

type AlptisFixtures = {
  authenticatedPage: void;    // Page authentifiée
  formPage: void;             // Page sur le formulaire
  formWithSection1: void;     // Formulaire avec Section 1 remplie
  formWithSection2: void;     // + Section 2
  formWithSection3: void;     // + Section 3
  leadData: AlptisFormData;   // Données du lead transformées
};

export const test = base.extend<AlptisFixtures>({
  /**
   * Fixture: données du lead
   * Détecte le type de lead depuis le titre du test (emojis) ou LEAD_INDEX
   */
  leadData: async ({}, use, testInfo) => {
    let lead;

    // Sélection par index si LEAD_INDEX défini
    const leadIndexEnv = process.env.LEAD_INDEX;
    if (leadIndexEnv !== undefined) {
      lead = selectLeadByIndex(parseInt(leadIndexEnv, 10));
    } else {
      // Sélection par type basée sur le titre
      let leadType: LeadType = 'random';
      if (testInfo.title.includes('👫')) leadType = 'conjoint';
      if (testInfo.title.includes('👶')) leadType = 'children';
      if (testInfo.title.includes('👨‍👩‍👧')) leadType = 'both';

      lead = selectLead(leadType);
    }

    const data = LeadTransformer.transform(lead);
    await use(data);
  },

  /**
   * Fixture: page authentifiée
   * Utilise le registry pour récupérer l'instance d'auth
   */
  authenticatedPage: async ({ page }, use) => {
    console.log('🔐 [FIXTURE] Authentification...');
    const auth = AlptisInstances.getAuth();
    await auth.login(page);
    console.log('✅ [FIXTURE] Authentifié');
    await use();
  },

  /**
   * Fixture: page sur le formulaire
   * Dépend de authenticatedPage + effectue la navigation
   */
  formPage: async ({ page, authenticatedPage }, use) => {
    console.log('🧭 [FIXTURE] Navigation vers formulaire...');
    const nav = AlptisInstances.getNavigationStep();
    await nav.execute(page);
    console.log('✅ [FIXTURE] Sur le formulaire');
    await use();
  },

  /**
   * Fixture: formulaire avec Section 1 remplie
   * Dépend de formPage + remplit Section 1
   */
  formWithSection1: async ({ page, formPage, leadData }, use) => {
    console.log('📝 [FIXTURE] Remplissage Section 1...');
    const step = AlptisInstances.getFormFillStep();
    await step.fillMiseEnPlace(page, leadData);
    console.log('✅ [FIXTURE] Section 1 remplie');
    await use();
  },

  // ... autres fixtures (formWithSection2, formWithSection3)
});

export { expect } from '@playwright/test';
```

**Chaîne de dépendances des fixtures** :
```
page (Playwright)
  ↓
authenticatedPage (login)
  ↓
formPage (navigation)
  ↓
formWithSection1 (section 1)
  ↓
formWithSection2 (section 2)
  ↓
formWithSection3 (section 3)
```

### 📝 Écrire un Test

**Exemple simple** :

```typescript
import { test, expect } from './fixtures';

test('Remplir Section 1', async ({ page, formPage, leadData }) => {
  // formPage = déjà authentifié + sur le formulaire
  const step = AlptisInstances.getFormFillStep();

  // Remplir Section 1
  await step.fillMiseEnPlace(page, leadData);

  // Vérifier
  const dateInput = page.locator('input[placeholder="Ex : 01/01/2020"]').first();
  await expect(dateInput).toHaveValue(leadData.mise_en_place.date_effet);
});
```

**Exemple avec fixture composée** :

```typescript
test('Remplir Section 4 (enfants)', async ({ page, formWithSection3, leadData }) => {
  // formWithSection3 = sections 1, 2, 3 déjà remplies
  const step = AlptisInstances.getFormFillStep();

  // Remplir Section 4
  await step.fillEnfantsToggle(page, !!leadData.enfants);
  if (leadData.enfants) {
    await step.fillEnfants(page, leadData.enfants);
  }

  // Vérifications...
});
```

**Exemple avec sélection de lead par type** :

```typescript
test('👫 Parcours avec conjoint', async ({ page, formPage, leadData }) => {
  // Le titre contient 👫, donc leadData contiendra un lead avec conjoint
  expect(leadData.conjoint).toBeDefined();

  const step = AlptisInstances.getFormFillStep();
  await step.fillMiseEnPlace(page, leadData);
  await step.fillAdherent(page, leadData);
  await step.fillConjointToggle(page, true);
  await step.fillConjoint(page, leadData.conjoint);
});

test('👶 Parcours avec enfants', async ({ page, formPage, leadData }) => {
  // Le titre contient 👶, donc leadData contiendra un lead avec enfants
  expect(leadData.enfants).toBeDefined();
  // ...
});
```

### 🚀 Lancer les Tests

#### Tests Complets

```bash
# Tous les tests Alptis
pnpm test:e2e:alptis

# Tests d'un produit spécifique
pnpm test:e2e:alptis:sante-select

# Tests détaillés uniquement
npx playwright test e2e/alptis/sante-select/.detailed/

# Un fichier spécifique
npx playwright test e2e/alptis/sante-select/journey.spec.ts

# Avec UI mode (utile pour debug)
npx playwright test --ui

# En mode debug
npx playwright test --debug

# Avec un navigateur visible
npx playwright test --headed
```

#### Tests avec Sélection de Lead

```bash
# Utiliser le lead à l'index 5
LEAD_INDEX=5 npx playwright test e2e/alptis/sante-select/single-lead-journey.spec.ts

# Tester un lead spécifique avec debug
LEAD_INDEX=12 npx playwright test --debug e2e/alptis/sante-select/journey.spec.ts
```

#### Tests avec Debug Cookies

```bash
# Activer les logs d'interception cookies
ALPTIS_DEBUG_COOKIES=1 npx playwright test e2e/alptis/auth/
```

#### Reporters

```bash
# Reporter ligne (par défaut)
npx playwright test --reporter=line

# Reporter dot (minimaliste)
npx playwright test --reporter=dot

# Reporter HTML (génère un rapport)
npx playwright test --reporter=html
# Puis ouvrir: npx playwright show-report

# Reporter liste (détaillé)
npx playwright test --reporter=list
```

### 📊 Types de Tests

#### 1. Tests Journey (Parcours Complets)

**Fichier**: `journey.spec.ts`

Tests qui parcourent tout le formulaire du début à la fin.

```typescript
test('👫 Journey complet avec conjoint', async ({ page, formPage, leadData }) => {
  const step = AlptisInstances.getFormFillStep();

  // Section 1
  await step.fillMiseEnPlace(page, leadData);

  // Section 2
  await step.fillAdherent(page, leadData);

  // Section 3 (conjoint)
  await step.fillConjointToggle(page, true);
  await step.fillConjoint(page, leadData.conjoint);

  // Vérifications finales
  // ...
});
```

#### 2. Tests Bulk Validation

**Fichier**: `bulk-validation.spec.ts`

Teste la transformation de tous les leads (22 leads pour Alptis).

```typescript
test('Transformer 22 leads', async () => {
  const leads = loadAllLeads();
  let successCount = 0;

  for (const lead of leads) {
    try {
      const transformed = LeadTransformer.transform(lead);
      verifyTransformedData(transformed, lead);
      successCount++;
    } catch (error) {
      console.error(`Lead ${lead.id} failed:`, error);
    }
  }

  expect(successCount).toBe(22);
});
```

#### 3. Tests Détaillés (Detailed)

**Dossier**: `.detailed/`

Tests unitaires de chaque section/fonctionnalité.

```typescript
// form-fill.section1.spec.ts
test('Section 1: Mise en place', async ({ page, formPage, leadData }) => {
  const step = AlptisInstances.getFormFillStep();
  await step.fillMiseEnPlace(page, leadData);

  // Vérifications spécifiques Section 1
  const toggle = page.locator("[class*='totem-toggle__input']").first();
  await expect(toggle).not.toBeChecked();
  // ...
});

// form-fill.section2.spec.ts
test('Section 2: Adhérent', async ({ page, formWithSection1, leadData }) => {
  // Section 1 déjà remplie via fixture
  const step = AlptisInstances.getFormFillStep();
  await step.fillAdherent(page, leadData);
  // ...
});
```

### 🔍 Debug et Troubleshooting

#### Voir les Logs Détaillés

```bash
# Logs complets Playwright
DEBUG=pw:api npx playwright test

# Logs du navigateur
npx playwright test --debug
```

#### Capturer des Screenshots

```typescript
test('Mon test', async ({ page }) => {
  await page.screenshot({ path: 'debug-screenshot.png' });

  // Ou screenshot d'un élément
  const element = page.locator('.ma-classe');
  await element.screenshot({ path: 'element-screenshot.png' });
});
```

#### Pause pour Inspection

```typescript
test('Mon test', async ({ page }) => {
  // Le test se met en pause ici
  await page.pause();

  // Vous pouvez inspecter la page manuellement
});
```

#### Vérifier les Imports

Si vous avez des erreurs de modules:

```bash
# Vérifier les chemins relatifs
grep -r "from '@/main/flows" src/main/flows/

# Doit retourner: (vide, tous les imports doivent être relatifs)
```

---

## ➕ Ajouter une Nouvelle Plateforme

### Étape 1 : Créer la Configuration

**Fichier** : `config/swisslife.config.ts`

```typescript
export const SwissLifeTimeouts = {
  toggle: 300,
  formFieldsAppear: 500,
  iframeLoad: 2000,  // Spécifique si iframe
  // ... selon les besoins
} as const;

export const SwissLifeUrls = {
  login: 'https://...',
  productForm: 'https://...',
} as const;

export const SwissLifeSelectors = {
  dateInput: 'input[type="date"]',
  customComponent: '[data-custom-component]',  // Si composants custom
  // ... selon le formulaire
} as const;

export const SwissLifeEnvVars = {
  username: 'SWISSLIFE_USERNAME',
  password: 'SWISSLIFE_PASSWORD',
} as const;

export interface SwissLifeCredentials {
  username: string;
  password: string;
}

export function getSwissLifeCredentials(): SwissLifeCredentials {
  const username = process.env[SwissLifeEnvVars.username];
  const password = process.env[SwissLifeEnvVars.password];

  if (!username || !password) {
    throw new Error('Missing SwissLife credentials');
  }

  return { username, password };
}
```

**Ajouter au barrel export** : `config/index.ts`

```typescript
export * from './alptis.config';
export * from './swisslife.config';  // ← Ajouter cette ligne
```

### Étape 2 : Créer la Structure

```
platforms/swisslife/
├── lib/
│   ├── SwissLifeAuth.ts           # Auth spécifique SwissLife
│   └── iframe-handler.ts          # Si nécessaire pour iframe
│
└── products/one/
    ├── steps/ (ou handlers/, adaptez selon besoins)
    │   ├── login/
    │   ├── navigation/
    │   └── form-fill/
    │       ├── [Orchestrator ou autre pattern]
    │       ├── components/        # Pour composants custom si iframe
    │       └── strategies/        # Pour gestion spécificités
    │
    └── transformers/
        ├── LeadTransformer.ts
        ├── types.ts
        └── ...
```

**Important** : La structure peut être différente d'Alptis ! Adaptez selon les besoins (iframe, composants custom, etc.)

### Étape 3 : Ajouter au Registry

**Fichier** : `registry.ts`

```typescript
import { SwissLifeAuth } from './platforms/swisslife/lib/SwissLifeAuth';
import { getSwissLifeCredentials } from './config';

export const SwissLifeInstances = {
  getAuth: () => registry.get('swisslife-auth', () =>
    new SwissLifeAuth(getSwissLifeCredentials())
  ),

  getNavigationStep: () => registry.get('swisslife-navigation', () =>
    new SwissLifeNavigationStep()
  ),

  // ... autres instances

  reset: () => {
    registry.reset('swisslife-auth');
    registry.reset('swisslife-navigation');
    // ... reset autres instances
  },
};
```

### Étape 4 : Créer les Tests E2E

```
e2e/swisslife/
├── fixtures.ts              # Fixtures Playwright (utilise SwissLifeInstances)
├── types.ts
├── helpers/
│   ├── loadLeads.ts        # Adapter pour source SwissLife
│   ├── leadSelector.ts     # Peut réutiliser celui d'Alptis
│   └── verification/       # Vérifications spécifiques
│
└── one/
    ├── journey.spec.ts
    ├── bulk-validation.spec.ts
    └── .detailed/
```

**Exemple fixtures** :

```typescript
import { test as base } from '@playwright/test';
import { SwissLifeInstances } from '../../src/main/flows/registry';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    const auth = SwissLifeInstances.getAuth();
    await auth.login(page);
    await use();
  },

  formPage: async ({ page, authenticatedPage }, use) => {
    const nav = SwissLifeInstances.getNavigationStep();
    await nav.execute(page);
    await use();
  },

  // ... autres fixtures
});
```

**Ajouter script npm** : `package.json`

```json
{
  "scripts": {
    "test:e2e:swisslife": "playwright test e2e/swisslife/",
    "test:e2e:swisslife:one": "playwright test e2e/swisslife/one/"
  }
}
```

---

## 📚 Patterns et Best Practices

### Configuration

- ✅ **Toujours centraliser** timeouts, URLs, selectors dans `config/`
- ✅ **Utiliser `as const`** pour type safety
- ✅ **Grouper par type** (Timeouts, Urls, Selectors, EnvVars)
- ✅ **Documenter** chaque constante avec un commentaire si nécessaire

### Code

- ✅ **Chemins relatifs** pour les imports (pas de path aliases `@/...`)
- ✅ **Registry** pour instances partagées
- ✅ **JSDoc** pour documenter les fonctions
- ✅ **Types stricts** partout (éviter `any`)
- ✅ **Nommage explicite** (pas d'abréviations obscures)

### Tests

- ✅ **Fixtures Playwright** pour setup/teardown
- ✅ **Registry** pour instances partagées
- ✅ **3 types de tests** : journey + bulk validation + detailed
- ✅ **Vérifications** après chaque étape
- ✅ **Logs explicites** (`console.log` pour suivre l'exécution)
- ✅ **Isolation** : chaque test doit être indépendant

### Architecture

- ✅ **Séparation des responsabilités** : auth / navigation / form-fill / transform
- ✅ **Operations réutilisables** : DateOps, DropdownOps, etc.
- ✅ **Mappers dédiés** : profession, regime, civilite
- ✅ **Validators** : age, eligibility, format
- ✅ **Pas de duplication** : centraliser la logique commune

---

## 🚀 Prochaines Étapes

1. **SwissLife** : Appliquer le pattern avec adaptations pour iframe/composants custom
2. **Autres plateformes** : MAAF, Malakoff Humanis, etc.
3. **Améliorations** :
   - Retry strategies (tentatives multiples en cas d'échec)
   - Error recovery (récupération après erreur)
   - Reporting avancé (dashboard, métriques)
   - CI/CD integration (tests automatiques)

---

## 📖 Documentation Additionnelle

- **Alptis Mapping** : `cartography/alptis-sante-select-exhaustive-mapping.json`
- **Playwright Config** : `playwright.config.ts` à la racine
- **Lead Fixtures** : `src/main/__tests__/fixtures/emails/` (22 leads pour Alptis)

---

## 🐛 Troubleshooting

### Erreur: "Cannot find module"

```bash
# Vérifier que les imports utilisent des chemins relatifs
grep -r "from '@/main/flows" src/main/flows/
# Doit retourner: (vide)

# Calculer le bon chemin relatif
realpath --relative-to="src/main/flows/platforms/alptis/lib" "src/main/flows/config"
```

### Tests qui ne trouvent pas les credentials

```bash
# Vérifier que le .env existe et contient les variables
cat .env | grep ALPTIS

# Vérifier que dotenv est chargé (dans playwright.config.ts)
```

### Timeout sur les tests

```bash
# Augmenter le timeout global (playwright.config.ts)
export default defineConfig({
  timeout: 60000,  // 60 secondes
});

# Ou timeout spécifique pour un test
test('Mon test', async ({ page }) => {
  test.setTimeout(120000);  // 2 minutes
  // ...
});
```

### Registry qui ne réinitialise pas

```typescript
// Forcer la réinitialisation au début de chaque fichier de test
test.beforeEach(() => {
  AlptisInstances.reset();
});
```

---

**Temps estimé pour ajouter une plateforme** : 4-5 jours (vs 2-3 semaines sans ce système)

**Version** : 1.1 - Mise à jour Novembre 2025
