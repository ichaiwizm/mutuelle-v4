# Flow Automation - Mutuelle V4

Ce dossier contient l'infrastructure pour automatiser le remplissage de formulaires sur différentes plateformes d'assurance.

## 📁 Structure

```
flows/
├── README.md                    # Ce fichier
├── registry.ts                  # Registry pour instances partagées
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
- Sera ajouté selon le même pattern

## 🔧 Configuration Centralisée

Toutes les configurations sont centralisées dans `config/[platform].config.ts` pour éviter les magic numbers et strings hardcodés.

### Exemple : Alptis

```typescript
import { AlptisTimeouts, AlptisUrls, AlptisSelectors } from '@/main/flows/config';

// Timeouts
await page.waitForTimeout(AlptisTimeouts.dropdownProfession); // 500ms
await page.waitForTimeout(AlptisTimeouts.dropdownRegime);     // 700ms

// URLs
await page.goto(AlptisUrls.santeSelectForm);

// Selectors
const dateInput = page.locator(AlptisSelectors.dateInput);
```

### Variables d'Environnement

```bash
# Alptis
ALPTIS_TEST_USERNAME=your-username
ALPTIS_TEST_PASSWORD=your-password
ALPTIS_DEBUG_COOKIES=1  # Optionnel : debug interception cookies
LEAD_INDEX=5            # Optionnel : sélectionner un lead spécifique
```

## 📦 Registry (Instances Partagées)

Le registry permet d'éviter de recréer les instances à chaque fois.

### Utilisation

```typescript
import { AlptisInstances } from '@/main/flows/registry';

// Dans les tests
const auth = AlptisInstances.getAuth();
await auth.login(page);

const nav = AlptisInstances.getNavigationStep();
await nav.execute(page);

const formFill = AlptisInstances.getFormFillStep();
await formFill.fillMiseEnPlace(page, formData);
```

### Réinitialisation

```typescript
// Réinitialiser toutes les instances Alptis
AlptisInstances.reset();
```

## ➕ Ajouter une Nouvelle Plateforme

### Étape 1 : Créer la Configuration

**Fichier** : `config/swisslife.config.ts`

```typescript
export const SwissLifeTimeouts = {
  toggle: 300,
  formFieldsAppear: 500,
  // ... selon les besoins
} as const;

export const SwissLifeUrls = {
  login: 'https://...',
  productForm: 'https://...',
} as const;

export const SwissLifeSelectors = {
  dateInput: 'input[type="date"]',
  // ... selon le formulaire
} as const;

export const SwissLifeEnvVars = {
  username: 'SWISSLIFE_USERNAME',
  password: 'SWISSLIFE_PASSWORD',
} as const;

export function getSwissLifeCredentials() {
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
│   └── SwissLifeAuth.ts           # Auth spécifique SwissLife
│
└── products/one/
    ├── steps/ (ou handlers/, ce qui fait sens)
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
import { getSwissLifeCredentials } from './config/swisslife.config';

export const SwissLifeInstances = {
  getAuth: () => registry.get('swisslife-auth', () =>
    new SwissLifeAuth(getSwissLifeCredentials())
  ),

  // ... autres instances

  reset: () => {
    registry.reset('swisslife-auth');
    // ... reset autres instances
  },
};
```

### Étape 4 : Créer les Tests E2E

```
e2e/swisslife/
├── fixtures.ts              # Fixtures Playwright (utilise SwissLifeInstances)
├── types/
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
import { SwissLifeInstances } from '@/main/flows/registry';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    const auth = SwissLifeInstances.getAuth();
    await auth.login(page);
    await use();
  },
  // ...
});
```

## 📚 Patterns Recommandés

### Config
- ✅ Toujours centraliser timeouts, URLs, selectors dans `config/`
- ✅ Utiliser `as const` pour type safety
- ✅ Grouper par type (Timeouts, Urls, Selectors, EnvVars)

### Code
- ✅ Importer depuis `@/main/flows/config` (pas de chemins relatifs)
- ✅ Utiliser le registry pour instances partagées
- ✅ Documenter les fonctions avec JSDoc
- ✅ Types stricts partout

### Tests
- ✅ Utiliser fixtures Playwright pour setup/teardown
- ✅ Utiliser le registry pour instances
- ✅ Tests journey + bulk validation + detailed
- ✅ Vérifications après chaque étape

## 🚀 Prochaines Étapes

1. **SwissLife** : Appliquer le pattern avec adaptations pour iframe
2. **Autres plateformes** : MAAF, Malakoff Humanis, etc.
3. **Améliorations** : Retry strategies, error recovery, reporting

## 📖 Documentation Additionnelle

- **Alptis Mapping** : `cartography/alptis-sante-select-exhaustive-mapping.json`
- **Tests E2E** : Voir `e2e/alptis/README.md` (si existe)
- **Playwright Config** : `playwright.config.ts` à la racine

---

**Temps estimé pour ajouter une plateforme** : 4-5 jours (vs 2-3 semaines sans ce système)
