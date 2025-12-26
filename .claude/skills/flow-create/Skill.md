---
name: flow-create
description: Creer un nouveau flow d'automatisation de formulaire complet, incluant exploration du site web, implementation et tests.
---

# flow-create

Cree un nouveau flow d'automatisation de formulaire web complet.

## Declenchement

```
/flow-create {platform} {product}
```

Exemples :
- `/flow-create alptis prevoyance-tns`
- `/flow-create swisslifeone sante-famille`

## Workflow complet

### Phase 0 : Verification initiale

1. **Verifier si le flow existe deja**
   ```bash
   ls src/main/flows/config/products/{platform}-{product}.ts
   ```
   Si le flow existe, suggerer `/flow-fix` a la place.

2. **Verifier les credentials**
   ```bash
   grep -q "{PLATFORM}_USERNAME" .env && grep -q "{PLATFORM}_PASSWORD" .env
   ```
   Variables requises :
   - Pour Alptis : `ALPTIS_TEST_USERNAME`, `ALPTIS_TEST_PASSWORD`
   - Pour SwissLife : `SWISSLIFE_USERNAME`, `SWISSLIFE_PASSWORD`

   Si manquants, demander a l'utilisateur de les ajouter au fichier `.env`.

3. **Creer la branche de travail**
   ```bash
   git checkout -b flow/{platform}-{product}
   ```
   COMMIT : `chore: create branch flow/{platform}-{product}`

---

### Phase 1 : Exploration du formulaire

L'exploration se fait en mode **headless** (pas de fenetre visible).

1. **Creer le test d'exploration Playwright**

   Creer le fichier : `e2e/{platform}/{product}/.detailed/explore-selectors.spec.ts`

   Template base sur : `e2e/swisslifeone/slsis/.detailed/inspect-section6-selectors.spec.ts`

   ```typescript
   import { test } from '@playwright/test';
   import { create{Platform}Services } from '@/main/flows/engine/services';
   import { get{Platform}Credentials } from '@/main/flows/config';

   test.describe('Selector Exploration - {Product}', () => {
     test('Explore all form sections', async ({ page }) => {
       test.setTimeout(600000); // 10 minutes

       // 1. Auth
       const services = create{Platform}Services(get{Platform}Credentials());
       await services.auth.login(page);

       // 2. Navigate to form
       await page.goto('{FORM_URL}');
       await page.waitForLoadState('networkidle');

       // 3. For each section: inspect elements
       console.log('\n====== SECTION 1 ======');
       const snapshot1 = await page.locator('body').ariaSnapshot();
       console.log('ARIA Snapshot:', snapshot1.substring(0, 2000));

       // 4. Inspect all inputs
       const inputs = await page.locator('input, select, textarea').all();
       for (const input of inputs) {
         const id = await input.getAttribute('id');
         const name = await input.getAttribute('name');
         const type = await input.getAttribute('type');
         const placeholder = await input.getAttribute('placeholder');
         const isVisible = await input.isVisible();

         if (isVisible) {
           // Evaluate stability
           let stability = 'STABLE';
           if (!id) stability = 'UNSTABLE';
           else if (/^[0-9a-f]{8}-/.test(id)) stability = 'UNSTABLE (UUID)';

           console.log({ id, name, type, placeholder, stability });
         }
       }

       // 5. Capture screenshot
       await page.screenshot({
         path: `src/main/flows/cartography/{platform}/{product}-section1.png`
       });

       // Repeter pour chaque section...
     });
   });
   ```

2. **Lancer l'exploration en headless**
   ```bash
   npx playwright test e2e/{platform}/{product}/.detailed/explore-selectors.spec.ts --timeout=600000
   ```

3. **Generer le JSON de cartographie**

   Creer : `src/main/flows/cartography/{platform}/{platform}-{product}-exhaustive-mapping.json`

   Template base sur : `src/main/flows/cartography/alptis/alptis-sante-select-exhaustive-mapping.json`

   ```json
   {
     "product": {
       "name": "{Product Display Name}",
       "platform": "{platform}",
       "url": "https://...",
       "cartography_date": "YYYY-MM-DD"
     },
     "metadata": {
       "form_title": "...",
       "total_steps": 2,
       "framework": "Vue.js | Angular | React",
       "design_system": "Totem | Bootstrap | Custom"
     },
     "form_structure": {
       "sections": [
         { "name": "Section 1", "fields_count": 3 },
         { "name": "Section 2", "fields_count": 8 }
       ]
     },
     "fields": [
       {
         "field_id": "nom",
         "section": "Adherent",
         "type": "text",
         "selector": {
           "primary": "#nom",
           "alternative": "input[placeholder='Ex : Durand']",
           "stability": "STABLE"
         },
         "validation": {
           "required": true,
           "pattern": "^[a-zA-Z-' ]+$"
         }
       }
     ]
   }
   ```

   COMMIT : `feat({platform}/{product}): add form cartography`

---

### Phase 2 : Scaffolding

Creer l'arborescence complete :

```
src/main/flows/
├── config/products/{platform}-{product}.ts          # ProductConfiguration
└── platforms/{platform}/products/{product}/
    ├── steps/
    │   ├── form-fill/
    │   │   ├── FormFillOrchestrator.ts
    │   │   ├── index.ts
    │   │   ├── selectors/
    │   │   │   ├── section1.ts
    │   │   │   ├── section2.ts
    │   │   │   ├── common.ts
    │   │   │   └── index.ts
    │   │   ├── sections/
    │   │   │   ├── Section1Fill.ts
    │   │   │   └── Section2Fill.ts
    │   │   └── operations/
    │   │       ├── DateOperations.ts
    │   │       ├── DropdownOperations.ts
    │   │       ├── RadioOperations.ts
    │   │       ├── ToggleOperations.ts
    │   │       └── index.ts
    │   └── navigation/
    │       └── index.ts
    └── transformers/
        ├── LeadTransformer.ts
        ├── types.ts
        ├── mappers/
        │   ├── civilite-mapper.ts
        │   ├── profession-mapper.ts
        │   └── regime-mapper.ts
        └── validators/
            ├── lead-validator.ts
            └── eligibility-validator.ts

e2e/{platform}/{product}/
├── fixtures.ts
├── single-lead-journey.spec.ts
├── bulk-validation.spec.ts
└── .detailed/
    ├── explore-selectors.spec.ts
    ├── form-fill.section1.spec.ts
    ├── form-fill.section2.spec.ts
    └── transformer.spec.ts
```

**Fichiers de reference a copier/adapter :**

| Type | Fichier de reference |
|------|---------------------|
| ProductConfiguration | `src/main/flows/config/products/alptis-sante-pro-plus.ts` |
| FormFillOrchestrator | `src/main/flows/platforms/alptis/products/sante-pro-plus/steps/form-fill/FormFillOrchestrator.ts` |
| Selectors | `src/main/flows/platforms/alptis/products/sante-pro-plus/steps/form-fill/selectors/section2.ts` |
| Operations | `src/main/flows/platforms/alptis/products/sante-pro-plus/steps/form-fill/operations/` |
| LeadTransformer | `src/main/flows/platforms/alptis/products/sante-pro-plus/transformers/LeadTransformer.ts` |
| Mappers | `src/main/flows/platforms/alptis/products/sante-pro-plus/transformers/mappers/` |
| Fixtures e2e | `e2e/alptis/fixtures.ts` |
| Single lead test | `e2e/alptis/sante-pro-plus/single-lead-journey.spec.ts` |

COMMIT : `feat({platform}/{product}): scaffold flow structure`

---

### Phase 3 : Implementation section par section

Pour chaque section du formulaire (en ordre) :

1. **Types** : Definir `{Product}FormData` base sur la cartographie
   ```typescript
   export type {Product}FormData = {
     mise_en_place: {
       remplacement_contrat: boolean;
       date_effet: string;
     };
     adherent: {
       civilite: 'M.' | 'Mme';
       nom: string;
       prenom: string;
       date_naissance: string;
       // ... autres champs
     };
     conjoint?: { ... };
     enfants?: Array<{ ... }>;
   };
   ```

2. **Mappers** : Creer un mapper pour chaque enum
   ```typescript
   // mappers/profession-mapper.ts
   const PROFESSION_MAPPING: Record<string, string> = {
     'profession liberale': 'PROFESSIONS_LIBERALES',
     "chef d'entreprise": 'CHEFS_D_ENTREPRISE',
     // ... base sur la cartographie
   };

   export function mapProfession(value: string | undefined): string {
     if (!value) return 'AUTRES';
     return PROFESSION_MAPPING[value.toLowerCase().trim()] ?? 'AUTRES';
   }
   ```

3. **Selectors** : Definir avec stabilite
   ```typescript
   // selectors/section2.ts
   export const SECTION_2_SELECTORS = {
     nom: {
       primary: '#nom',
       stability: 'STABLE',
     },
     civilite: {
       primary: "input[name*='form-radio']",
       byValue: (v: 'monsieur' | 'madame') => `input[value='${v}']`,
       stability: 'UNSTABLE',
     },
     date_naissance: {
       primary: "input[placeholder='Ex : 01/01/2020']",
       note: "Use .nth(1) - first date field is date_effet",
       stability: 'MODERATE',
     },
   } as const;
   ```

4. **SectionFill** : Implementer le remplissage
   ```typescript
   // sections/Section2Fill.ts
   export class Section2Fill {
     async fill(page: Page, data: FormData, logger?: FlowLogger): Promise<void> {
       // Civilite
       const civiliteSelector = SELECTORS.civilite.byValue(
         data.adherent.civilite === 'M.' ? 'monsieur' : 'madame'
       );
       await page.locator(civiliteSelector).click({ force: true });

       // Nom
       await page.locator(SELECTORS.nom.primary).fill(data.adherent.nom);

       // ... etc
     }
   }
   ```

5. **Test detaille** : Tester la section isolement (headless)
   ```bash
   npx playwright test e2e/{platform}/{product}/.detailed/form-fill.section{n}.spec.ts
   ```

COMMIT apres chaque section : `feat({platform}/{product}): implement section {n} - {name}`

---

### Phase 4 : Integration

1. **Implementer le FormFillOrchestrator**
   ```typescript
   export class FormFillOrchestrator {
     private section1 = new Section1Fill();
     private section2 = new Section2Fill();

     async fillMiseEnPlace(page: Page, data: FormData, logger?: FlowLogger) {
       await this.section1.fill(page, data, logger);
     }

     async fillAdherent(page: Page, data: FormData, logger?: FlowLogger) {
       await this.section2.fill(page, data, logger);
     }
     // ...
   }
   ```

2. **Enregistrer dans PRODUCT_CONFIGS**

   Editer `src/main/flows/config/products/index.ts` :
   ```typescript
   import { {PLATFORM}_{PRODUCT} } from "./{platform}-{product}";

   export const PRODUCT_CONFIGS: Record<string, ProductConfiguration> = {
     // ... existing
     [{PLATFORM}_{PRODUCT}.flowKey]: {PLATFORM}_{PRODUCT},
   };
   ```

3. **Creer ServiceFactory** si nouvelle plateforme

4. **Tester single lead** (headless)
   ```bash
   LEAD_INDEX=0 npx playwright test e2e/{platform}/{product}/single-lead-journey.spec.ts
   ```

COMMIT : `feat({platform}/{product}): integrate flow with FlowEngine`

---

### Phase 5 : Tests bulk et generation de leads

1. **Tester sur tous les leads existants** (headless)
   ```bash
   npx playwright test e2e/{platform}/{product}/bulk-validation.spec.ts
   ```

2. **Si aucun lead compatible** : Generer des fixtures JSON programmatiquement

   Creer dans `src/main/__tests__/fixtures/emails/` :
   - `email-{next}-solo.json` : Lead sans conjoint ni enfants
   - `email-{next}-conjoint.json` : Lead avec conjoint
   - `email-{next}-enfants.json` : Lead avec enfants
   - `email-{next}-both.json` : Lead avec conjoint ET enfants

   Format :
   ```json
   {
     "id": "fixture-{product}-solo",
     "subject": "Nouveau lead - {Product} Solo",
     "from": "test@fixture.com",
     "date": 1700000000000,
     "text": "Civilite: M.\nNom: DUPONT\nPrenom: Jean\n..."
   }
   ```

3. **Iterer jusqu'a 100% de succes**
   - Si un test echoue : identifier le probleme, corriger, re-tester
   - Repeter jusqu'a ce que bulk-validation passe a 100%

COMMIT : `test({platform}/{product}): add test fixtures and bulk validation`

---

### Phase 6 : Validation utilisateur

Quand tous les tests passent OU si bloque :

```
Flow {platform}_{product} pret pour review.

Status:
- Sections implementees: {n}/{total}
- Tests bulk: {passed}/{total} leads
- Coverage: {percentage}%

Prochaines etapes:
1. Review du code
2. Merge de la branche
3. Test manuel si necessaire
```

Demander a l'utilisateur s'il veut :
1. Merger la branche
2. Faire des ajustements
3. Voir les details d'un probleme

---

## Conventions

### Nommage
| Element | Pattern | Exemple |
|---------|---------|---------|
| flowKey | `{platform}_{product}` | `alptis_sante_select` |
| Branche | `flow/{platform}-{product}` | `flow/alptis-prevoyance-tns` |
| Config file | `{platform}-{product}.ts` | `alptis-prevoyance-tns.ts` |

### Pattern de selectors
```typescript
{
  primary: "#semantic-id",              // Le plus stable
  alternative: ".class-selector",       // Fallback
  byValue: (v) => `[value='${v}']`,    // Pour radios/options
  byRole: "combobox",                   // Pour Playwright roles
  byPosition: ".item:nth(0)",           // Si necessaire
  fallback: "label:has-text('...')",   // Dernier recours
  stability: 'STABLE' | 'MODERATE' | 'UNSTABLE',
}
```

### Format commits
```
{type}({platform}/{product}): {description}

- Detail 1
- Detail 2

Generated with Claude Code

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

Types : `feat`, `fix`, `test`, `chore`, `docs`

---

## Checklist

- [ ] Branche `flow/{platform}-{product}` creee
- [ ] Credentials disponibles dans .env
- [ ] Exploration terminee
- [ ] Cartographie JSON generee
- [ ] ProductConfiguration creee et enregistree
- [ ] Types FormData definis
- [ ] Tous les mappers implementes
- [ ] Tous les validators implementes
- [ ] LeadTransformer fonctionnel
- [ ] Tous les selectors definis avec stabilite
- [ ] Toutes les operations implementees
- [ ] FormFillOrchestrator complet
- [ ] Fixtures de test creees
- [ ] Tests single-lead passent (headless)
- [ ] Tests bulk-validation passent 100% (headless)
- [ ] Commits apres chaque etape majeure
