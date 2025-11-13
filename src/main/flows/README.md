# Flow Automation System

Architecture squelette pour l'automation de produits d'assurance.

## 📁 Structure

```
flows/
├── engine/              # Moteur d'orchestration
│   ├── FlowEngine.ts   # Point d'entrée principal
│   ├── QueueManager.ts # Gestion de la queue avec workers
│   ├── BrowserPool.ts  # Pool de contextes Playwright
│   └── ArtifactManager.ts  # Gestion des artifacts
│
├── core/               # Abstractions et utilitaires réutilisables
│   ├── BaseProduct.ts  # Classe abstraite pour produits
│   ├── BaseStep.ts     # Classe abstraite pour étapes
│   ├── BaseTransformer.ts  # Transformation Lead → FormData
│   ├── IframeNavigator.ts  # Navigation iframes
│   ├── DelayHandler.ts     # Gestion délais/timing
│   ├── ConditionalFieldHandler.ts  # Champs conditionnels
│   ├── FormFieldFiller.ts  # Remplissage formulaires
│   └── QuoteExtractor.ts   # Extraction devis
│
├── registry/
│   └── ProductRegistry.ts  # Enregistrement des produits
│
├── types/              # Définitions TypeScript
│   ├── FlowTypes.ts
│   ├── ProductTypes.ts
│   └── QueueTypes.ts
│
└── products/           # Implémentations produits (vide pour l'instant)
    └── README.md
```

## 🚀 Utilisation

### Créer un nouveau produit

```typescript
import { BaseProduct, BaseTransformer, BaseStep } from '../core';
import type { ExecutionContext, ProductResult } from '../types';

// 1. Définir les types
interface MyProductFormData {
  // ...
}

// 2. Créer le transformer
class MyProductTransformer extends BaseTransformer<MyProductFormData> {
  transform(lead: Lead): TransformResult<MyProductFormData> {
    // Transformer Lead en FormData
  }
}

// 3. Créer les steps
class LoginStep extends BaseStep {
  async execute(context: StepContext): Promise<StepResult> {
    // Logique de connexion
  }
}

// 4. Créer le produit
class MyProduct extends BaseProduct {
  static metadata = {
    key: 'my-product',
    name: 'My Product',
    platform: 'my-platform',
    version: '1.0.0',
  };

  async execute(context: ExecutionContext): Promise<ProductResult> {
    // Orchestrer les étapes
  }

  getMetadata() {
    return MyProduct.metadata;
  }
}

// 5. Enregistrer
import { ProductRegistry } from '../registry';
ProductRegistry.getInstance().register('my-product', MyProduct);
```

### Exécuter l'automation

```typescript
import { Engine } from './flows';

// Exécute toutes les runs en queue
await Engine.runQueued();
```

## 🔧 Configuration

### Queue Workers

```typescript
const queueManager = new QueueManager({
  maxWorkers: 3,          // 3 workers parallèles
  retryAttempts: 2,       // 2 tentatives de retry
  retryDelay: 2000,       // 2s entre chaque retry
  timeout: 300000,        // 5 minutes timeout
});
```

### Browser Options

```typescript
const browserPool = new BrowserPool({
  headless: true,         // Mode headless
  timeout: 30000,         // 30s timeout par défaut
  screenshots: true,      // Screenshots activés
  video: false,           // Video désactivée
});
```

## 📝 Workflow d'Exécution

1. `AutomationService.enqueue()` crée une run + runItems
2. `FlowEngine.runQueued()` démarre l'exécution
3. `QueueManager` traite les items en parallèle (3 workers)
4. Pour chaque item:
   - Récupère le Product depuis le Registry
   - Récupère Lead + Credentials depuis la DB
   - Obtient un contexte browser du BrowserPool
   - Exécute `Product.execute(context)`
   - Sauvegarde les artifacts
   - Met à jour le statut en DB

## 🎯 Principes

- **Tous les fichiers < 100 lignes**
- **Un fichier = une responsabilité**
- **Abstractions réutilisables dans core/**
- **Produits complètement indépendants dans products/**
- **Type-safety avec TypeScript strict**
- **File d'attente avec workers pour parallélisme**

## 📚 Prochaines Étapes

1. Implémenter les produits dans `products/`:
   - alptis-sante-select
   - alptis-sante-select-pro
   - swisslife-sante

2. Adapter le code du POC `test-forms/` vers cette architecture

3. Créer les tests unitaires pour chaque module
