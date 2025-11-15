# Test Forms - Sandbox de test pour l'automatisation des formulaires

Ce dossier est une **sandbox de test** qui permet de tester le code d'automatisation des formulaires développé dans `src/main/flows/platforms/`.

## Architecture

### Code de production
Le code réel d'automatisation se trouve dans :
```
src/main/flows/platforms/
└── alptis/
    ├── lib/                     # Code commun plateforme (AlptisAuth, helpers)
    └── products/
        └── sante-select/
            ├── lib/             # Code métier produit (transformers, validators, mappers)
            └── steps/           # Étapes du processus (LoginStep, FormFillStep, etc.)
```

### Tests (ce dossier)
Les tests qui valident ce code se trouvent ici :
```
test-forms/
├── tests/
│   └── alptis/
│       └── sante-select/
│           └── login.spec.ts   # Teste LoginStep
├── .env                        # Credentials (gitignored)
├── playwright.config.ts
└── tsconfig.json              # Configuré pour importer depuis src/main
```

## Configuration

### Variables d'environnement (.env)
```bash
ALPTIS_USERNAME=votre.email@example.com
ALPTIS_PASSWORD=votre_mot_de_passe
```

Le fichier `.env` est automatiquement ignoré par git pour la sécurité.

### Imports depuis src/main
Le `tsconfig.json` est configuré avec un alias pour faciliter les imports :
```typescript
import { LoginStep } from '@/platforms/alptis/products/sante-select/steps';
```

## Utilisation

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests Alptis
```bash
npm run test:alptis
```

### Mode UI (interface visuelle Playwright)
```bash
npm run test:alptis:ui
```

### Mode headed (voir le navigateur)
```bash
npm run test:alptis:headed
```

### Test spécifique login
```bash
npm run test:alptis:login
```

## Structure des tests

Chaque test importe et utilise le code de production :

```typescript
import { LoginStep } from '@/platforms/alptis/products/sante-select/steps';

test('test description', async ({ page }) => {
  const loginStep = new LoginStep({
    username: process.env.ALPTIS_USERNAME || '',
    password: process.env.ALPTIS_PASSWORD || '',
  });

  await loginStep.execute(page);

  // Assertions...
});
```

## Principe

Ce dossier est une **sandbox** qui permet de :
1. Tester le code d'automatisation avant de l'utiliser en production
2. Développer et debugger les étapes de formulaires
3. Valider que chaque step fonctionne correctement
4. Expérimenter sans impacter le code principal

Le code testé ici est le même qui sera utilisé en production dans le flow principal de l'application.
