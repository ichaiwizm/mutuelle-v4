# Test Forms - POC d'automatisation de formulaire

Ce projet est un **Proof of Concept (POC)** pour tester l'automatisation de formulaires avec Playwright. Il simule un parcours complet d'assurance mutuelle, du login à la génération de devis.

## 🎯 Objectif

Valider l'architecture d'automatisation de formulaire avant d'implémenter l'automatisation sur les vraies plateformes (Alptis, SwissLife, etc.).

## 📁 Structure du projet

```
test-forms/
├── server/              # Serveur Express de test
│   ├── index.ts        # Point d'entrée du serveur
│   ├── routes.ts       # Routes API
│   └── db.json         # Base de données JSON simple
├── public/             # Application web statique
│   ├── index.html      # Page de connexion
│   ├── home.html       # Page d'accueil
│   ├── form.html       # Formulaire de simulation
│   ├── quote.html      # Page de devis
│   ├── styles/         # Fichiers CSS
│   └── scripts/        # Fichiers JavaScript
├── src/                # Code source TypeScript
│   ├── types.ts        # Définitions de types
│   └── transformer.ts  # Lead → FormData transformer
├── tests/              # Tests Playwright
│   ├── helpers/        # Helpers pour les tests
│   └── form-automation.spec.ts  # Tests principaux
└── README.md           # Cette documentation
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- pnpm
- Les dépendances du projet parent doivent être installées

### Installation

```bash
# Depuis le dossier racine du projet
cd test-forms

# Les dépendances sont gérées par le workspace parent
# Si nécessaire :
cd .. && pnpm install
```

### Démarrer le serveur de test

```bash
# Option 1 : Depuis le dossier racine
./node_modules/.bin/tsx test-forms/server/index.ts

# Option 2 : Avec pnpm (si configuré dans le workspace)
cd test-forms
pnpm server
```

Le serveur démarrera sur **http://localhost:3100**

Vous verrez :
```
✅ Test server running on http://localhost:3100
📁 Serving static files from: /test-forms/public

Available pages:
  - http://localhost:3100/index.html (Login)
  - http://localhost:3100/home.html (Home)
  - http://localhost:3100/form.html (Form)
  - http://localhost:3100/quote.html (Quote)

API endpoints:
  - POST http://localhost:3100/api/login
  - POST http://localhost:3100/api/submit-quote
  - GET  http://localhost:3100/api/quotes
  - GET  http://localhost:3100/api/quotes/:id
```

### Tester manuellement

1. Ouvrez http://localhost:3100/index.html dans votre navigateur
2. Connectez-vous avec n'importe quel identifiant (auth factice)
3. Cliquez sur "Commencer une simulation"
4. Remplissez le formulaire
5. Cliquez sur "Obtenir mon devis"
6. Vous verrez votre devis généré

## 🤖 Tests automatisés Playwright

### Prérequis

```bash
# Installer Playwright (depuis le dossier racine)
pnpm playwright install
```

### Lancer les tests

**Important:** Le serveur doit être lancé avant de lancer les tests !

```bash
# Terminal 1 : Démarrer le serveur
./node_modules/.bin/tsx test-forms/server/index.ts

# Terminal 2 : Lancer les tests

# Mode headless (par défaut)
cd test-forms
pnpm test

# Mode headed (voir le navigateur)
pnpm test:headed

# Mode UI (interface interactive)
pnpm test:ui

# Mode debug (pas à pas)
pnpm test:debug
```

### Que testent les tests ?

Les tests automatisés :
1. Chargent les 15 fixtures d'emails depuis `src/main/__tests__/fixtures/emails/`
2. Parsent chaque email pour extraire un Lead
3. Transforment le Lead en FormData (dates, formats, etc.)
4. Automatisent le parcours complet :
   - Login → Page d'accueil
   - Navigation vers formulaire
   - Remplissage automatique du formulaire
   - Soumission
   - Vérification du devis généré
5. Vérifient que les données soumises correspondent au Lead d'origine

## 📝 Architecture du système

### Flow complet

```
Email (fixture)
    ↓
Parser (src/main/leads/parsing/parser.ts)
    ↓
Lead Object { subscriber, project, children }
    ↓
Transformer (src/transformer.ts)
    ↓
FormData { dates en HTML, formats corrects }
    ↓
FormFiller (tests/helpers/formFiller.ts)
    ↓
Formulaire HTML rempli automatiquement
    ↓
Soumission → API → db.json
    ↓
Page devis
    ↓
QuoteExtractor (tests/helpers/quoteExtractor.ts)
    ↓
Vérification des données
```

### Composants clés

#### 1. **LeadToFormDataTransformer** (`src/transformer.ts`)

Transforme un Lead (format email) en FormData (format HTML) :
- Dates : `DD/MM/YYYY` → `YYYY-MM-DD`
- Téléphone : Assure le format `XX.XX.XX.XX.XX`
- Booléens : Conversion correcte
- Validation : Vérifie que toutes les données requises sont présentes

```typescript
const transformer = new LeadToFormDataTransformer();
const formData = transformer.transform(lead);
```

#### 2. **FormFiller** (`tests/helpers/formFiller.ts`)

Helper Playwright pour remplir automatiquement les formulaires :
- `fillLoginForm()` : Connexion
- `navigateToForm()` : Navigation vers formulaire
- `fillForm()` : Remplissage complet du formulaire
- `submitForm()` : Soumission
- `completeFullFlow()` : Tout le parcours en une seule méthode

```typescript
const formFiller = createFormFiller(page);
await formFiller.completeFullFlow(formData);
```

#### 3. **QuoteExtractor** (`tests/helpers/quoteExtractor.ts`)

Helper pour extraire et vérifier les données du devis :
- `extractQuoteId()` : Récupère l'ID du devis
- `extractPrice()` : Récupère le prix
- `extractSubmittedData()` : Récupère toutes les données soumises
- `verifyDataMatch()` : Vérifie que les données correspondent au Lead

```typescript
const extractor = createQuoteExtractor(page);
const quoteId = await extractor.extractQuoteId();
const verification = await extractor.verifyDataMatch(lead);
```

## 🗄️ API du serveur

### POST /api/login
Authentification factice (toujours succès)

**Request:**
```json
{
  "username": "test",
  "password": "test"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "username": "test",
    "token": "uuid"
  }
}
```

### POST /api/submit-quote
Soumettre une demande de devis

**Request:**
```json
{
  "data": {
    "subscriber": { ... },
    "project": { ... },
    "children": [ ... ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "id": "uuid",
    "price": 123
  }
}
```

### GET /api/quotes
Récupérer tous les devis

**Response:**
```json
{
  "success": true,
  "quotes": [ ... ],
  "count": 5
}
```

### GET /api/quotes/:id
Récupérer un devis par ID

**Response:**
```json
{
  "success": true,
  "quote": {
    "id": "uuid",
    "timestamp": "2025-11-12T...",
    "data": { ... },
    "price": 123
  }
}
```

## 🔧 Développement

### Ajouter un nouveau test

1. Ajouter un fixture d'email dans `src/main/__tests__/fixtures/emails/`
2. Le test sera automatiquement détecté et exécuté

### Modifier le formulaire

1. Éditer `public/form.html` pour ajouter/modifier des champs
2. Mettre à jour `public/scripts/form.js` pour gérer les nouveaux champs
3. Mettre à jour `src/types.ts` avec les nouveaux types
4. Mettre à jour `src/transformer.ts` pour transformer les nouveaux champs
5. Mettre à jour `tests/helpers/formFiller.ts` pour remplir les nouveaux champs

### Debugging

**Serveur:**
```bash
# Lancer avec logs
./node_modules/.bin/tsx test-forms/server/index.ts

# Vérifier les logs
tail -f /tmp/test-server.log
```

**Tests:**
```bash
# Mode debug (pas à pas)
cd test-forms && pnpm test:debug

# Mode UI (interface interactive)
pnpm test:ui

# Mode headed avec slowMo
pnpm test:headed -- --slow-mo=1000
```

## 📊 Résultats des tests

Après l'exécution, les tests génèrent :
- **HTML Report** : `playwright-report/index.html`
- **Screenshots** : En cas d'échec
- **Vidéos** : En cas d'échec
- **Traces** : Pour le debugging

Ouvrir le rapport :
```bash
pnpm playwright show-report
```

## 🎯 Prochaines étapes

Une fois ce POC validé, l'architecture sera appliquée aux vraies plateformes :

1. **Alptis Santé Select**
   - Mapper les champs du formulaire réel
   - Créer le transformer spécifique
   - Adapter le FormFiller pour les spécificités Alptis

2. **SwissLife One SLIS**
   - Mapper les champs du formulaire réel
   - Créer le transformer spécifique
   - Adapter le FormFiller pour les spécificités SwissLife

3. **Généraliser**
   - Abstraire les patterns communs
   - Créer des adapters réutilisables
   - Ajouter la gestion d'erreurs robuste

## 📝 Notes importantes

- **Auth factice** : Le système accepte n'importe quel login/password
- **Prix aléatoires** : Les devis génèrent des prix aléatoires (50-200€)
- **Pas de validation métier** : Le formulaire accepte toutes les données valides
- **Stockage JSON** : Les devis sont stockés dans `server/db.json` (réinitialisé à chaque démarrage)
- **Pas de persistence** : Les données sont perdues à l'arrêt du serveur

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier que le port 3100 est libre
lsof -i :3100

# Tuer le processus si nécessaire
kill -9 $(lsof -t -i:3100)
```

### Les tests échouent

1. Vérifier que le serveur est lancé sur http://localhost:3100
2. Vérifier que Playwright est installé : `pnpm playwright install`
3. Lancer en mode headed pour voir ce qui se passe : `pnpm test:headed`
4. Vérifier les logs du serveur

### Erreur "Cannot find package 'express'"

```bash
# Installer les dépendances dans le workspace parent
cd ..
pnpm add express cors @types/express @types/cors -w
```

## 📚 Ressources

- [Playwright Documentation](https://playwright.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Auteur** : Claude Code
**Date** : Novembre 2025
**Version** : 1.0.0 (POC)
