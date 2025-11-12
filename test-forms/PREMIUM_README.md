# 🚀 Premium Product - POC d'Automatisation Complexe

Le produit **Premium** est un environnement de test avancé qui simule une plateforme d'assurance avec des complexités réalistes : iframes, délais de chargement, champs conditionnels, validations strictes et grille de sélection interactive.

## 🎯 Objectif

Valider que l'architecture d'automatisation peut gérer des cas difficiles avant de l'appliquer aux vraies plateformes (Alptis, SwissLife).

## 📋 Complexités Implémentées

### 1. **Navigation & Chargement Progressif**
- ✅ Redirection automatique (index.html → login.html)
- ✅ Composants qui apparaissent avec délai :
  - Champ password : +500ms
  - Bouton submit : +300ms après password
  - Bouton "Nouveau devis" : +600ms
  - Champ code postal : +400ms après ville

### 2. **Iframes**
- ✅ Page d'accueil entière dans un iframe
- ✅ Formulaire complet dans un iframe
- ✅ Navigation entre iframes

### 3. **Champs Conditionnels**
- ✅ **Régime fiscal** apparaît si profession = Independant/TNS/Artisan
- ✅ **Mutuelle actuelle** apparaît si actuellement assuré
- ✅ **Champs conjoint** apparaissent si hasConjoint
- ✅ **Champs enfants** générés dynamiquement selon le nombre

### 4. **Champs Supplémentaires**
- ✅ Numéro de sécurité sociale (généré automatiquement)
- ✅ Mutuelle actuelle
- ✅ Antécédents médicaux

### 5. **Profession avec Mapping Intelligent**
- ✅ Select limité à 10 options
- ✅ 50+ mappings prédéfinis
- ✅ Fuzzy matching par mots-clés
- ✅ Fallback vers "Autre"

### 6. **Validations Strictes**
- ✅ Date d'effet : minimum +7 jours
- ✅ Date de naissance : minimum 18 ans
- ✅ Téléphone : format 06/07.XX.XX.XX.XX
- ✅ Code postal : 5 chiffres
- ✅ Auto-ajustement automatique

### 7. **Grille de Sélection Interactive**
- ✅ 5 catégories × 4 niveaux = 20 options
- ✅ Prix mis à jour en temps réel
- ✅ Sélection visuelle (checkmarks)

---

## 🏗️ Architecture

```
products/premium/
├── index.html                 # Redirige vers login
├── login.html                 # Login avec délais
├── home-wrapper.html          # Wrapper iframe
├── home-iframe.html           # Contenu iframe
├── form-wrapper.html          # Wrapper formulaire
├── form-iframe.html           # Formulaire complet
├── quote-selection.html       # Grille interactive
├── quote.html                 # Devis final
├── scripts/
│   ├── delays.js             # Gestion délais
│   ├── login.js              # Logique login
│   ├── conditional-fields.js # Champs conditionnels
│   ├── validation.js         # Validation client
│   ├── form.js               # Logique formulaire
│   ├── quote-grid.js         # Grille interactive
│   └── quote.js              # Page devis
└── styles/
    ├── main.css              # Styles globaux
    └── premium.css           # Styles formulaire

src/products/premium/
├── types.ts                   # Types Premium
├── transformer.ts             # Transformateur principal
├── professionMapper.ts        # Mapping professions
├── validationAdapter.ts       # Adaptateur validation
└── dataEnricher.ts            # Enrichissement données

tests/premium/
├── premium-automation.spec.ts # Test principal (15 leads)
├── profession-mapping.spec.ts # Test mappings
└── validation.spec.ts         # Test validations
```

---

## 🚀 Démarrage Rapide

### 1. Installer les dépendances

```bash
cd test-forms
pnpm install
```

### 2. Démarrer le serveur

```bash
pnpm dev
```

Le serveur démarre sur `http://localhost:3100`

### 3. Tester manuellement

Ouvrir dans le navigateur :
- **Login** : http://localhost:3100/products/premium/login.html
- **Home** : http://localhost:3100/products/premium/home-wrapper.html (après login)

### 4. Lancer les tests automatisés

```bash
# Test principal sur les 15 leads
pnpm test tests/premium/premium-automation.spec.ts

# Tests de mapping des professions
pnpm test tests/premium/profession-mapping.spec.ts

# Tests de validation
pnpm test tests/premium/validation.spec.ts
```

---

## 🧪 Tests

### Test Principal : `premium-automation.spec.ts`

Teste **15 leads réels** avec le flux complet :

```
Email → Parser → PremiumTransformer → PremiumFormFiller → Quote
```

**Ce qui est testé** :
- ✅ Parsing de l'email
- ✅ Transformation avec adaptations (profession mapping, validations, enrichissement)
- ✅ Login avec délais
- ✅ Navigation dans les iframes
- ✅ Remplissage du formulaire complet
- ✅ Gestion des champs conditionnels
- ✅ Sélection des garanties
- ✅ Création du quote
- ✅ Vérification de la correspondance des données

**Exemple de résultat** :
```
[email-004.json] Lead ID: abc123
[email-004.json] Subscriber: Dupont Jean
[email-004.json] FormData profession: Consultant (mappé depuis "Profession libérale")
[email-004.json] FormData numeroSecu: 19900110012345 (généré)
[email-004.json] Quote ID: PREMIUM-2024-1234
[email-004.json] Quote Price: 89.00 €/mois
[email-004.json] ✓ Test réussi !
```

### Test de Mapping : `profession-mapping.spec.ts`

Teste **tous les mappings de professions** :
- Exact matches (Salarié → Salarie)
- Mappings intelligents (Profession libérale → Consultant)
- Fuzzy matching (travail libéral → Consultant)
- Fallbacks (xyz123 → Autre)

### Test de Validation : `validation.spec.ts`

Teste **toutes les règles de validation** :
- Date d'effet +7j minimum
- Âge 18+ ans
- Format téléphone strict
- Auto-ajustements

---

## 🔧 Adaptateurs Intelligents

### ProfessionMapper

**Problème** : Les professions des leads ne correspondent pas toutes au select limité.

**Solution** : Mapping intelligent avec 3 niveaux :
1. **Exact** : "Salarié" → "Salarie"
2. **Mapped** : "Profession libérale" → "Consultant"
3. **Fuzzy** : "travail libéral" → "Consultant"
4. **Fallback** : "xyz123" → "Autre"

**Exemple** :
```typescript
const mapping = ProfessionMapper.map("TNS : régime des indépendants");
// { formValue: "Independant", confidence: "mapped" }
```

### ValidationAdapter

**Problème** : Les données des leads ne respectent pas toujours les contraintes strictes.

**Solution** : Auto-ajustement automatique :
- Date d'effet trop proche → ajustée à J+7
- Âge <18 ans → ajusté à 18 ans
- Téléphone sans points → formaté automatiquement

**Exemple** :
```typescript
const { adapted, warnings } = validator.adapt(formData);
// warnings: ["dateEffet: Date ajustée à J+7 minimum"]
```

### DataEnricher

**Problème** : Champs Premium manquants dans les leads.

**Solution** : Génération automatique :
- Numéro de sécurité sociale → généré selon civilité + date de naissance
- Mutuelle actuelle → "Aucune" si pas assuré
- Régime fiscal → "Micro-entreprise" si TNS/Indépendant

---

## 📊 Statistiques

### Fichiers Créés pour Premium

- **10** fichiers TypeScript (types, adaptateurs, transformer)
- **8** pages HTML
- **7** scripts JavaScript
- **2** fichiers CSS
- **2** helpers de tests
- **3** suites de tests
- **1** routes serveur

**Total** : **33 fichiers** créés pour le produit Premium

### Tests

- **15 leads** testés automatiquement
- **50+ mappings** de professions
- **4 règles** de validation strictes
- **100%** de couverture du flux

---

## 🎓 Ce que Premium Démontre

1. ✅ **Navigation complexe** : Iframes imbriqués, redirections
2. ✅ **Chargement progressif** : Délais réalistes simulés
3. ✅ **Champs dynamiques** : Conditionnels, générés à la volée
4. ✅ **Mappings intelligents** : Fuzzy matching, fallbacks
5. ✅ **Validations strictes** : Auto-ajustements
6. ✅ **Enrichissement** : Génération de données manquantes
7. ✅ **Tests exhaustifs** : 15 leads × flux complet

---

## 🔄 Prochaines Étapes

Une fois le POC Premium validé :

1. **Appliquer l'architecture aux vraies plateformes** :
   - Alptis Santé Select
   - SwissLife One SLIS

2. **Créer les adaptateurs production** :
   - `AlptisAdapter extends BaseFormFiller`
   - `SwissLifeAdapter extends BaseFormFiller`

3. **Gérer les cas limites spécifiques** :
   - Captchas
   - Erreurs réseau
   - Timeouts

4. **Implémenter la gestion d'erreurs robuste** :
   - Retries automatiques
   - Notifications d'échec
   - Logs détaillés

---

## 📝 Notes Techniques

### Pourquoi des Iframes ?

Les plateformes réelles utilisent souvent des iframes pour la sécurité. Premium simule ce comportement.

### Pourquoi des Délais ?

Les vraies plateformes ont des chargements asynchrones (Ajax, lazy loading). Premium simule ce comportement.

### Pourquoi un Select Limité ?

Les vraies plateformes n'ont pas toutes les professions. Le mapping intelligent est crucial.

### Pourquoi des Validations Strictes ?

Les vraies plateformes ont des contraintes business (âge minimum, date d'effet, etc.). L'auto-ajustement évite les échecs.

---

## ✅ Conclusion

Le produit Premium est un **POC complet** qui valide l'architecture d'automatisation sur des cas difficiles réalistes. Tous les composants fonctionnent ensemble :

- ✅ Parser (du projet principal)
- ✅ Transformer avec adaptations
- ✅ Form filler avec iframes et délais
- ✅ Tests exhaustifs sur 15 leads

**L'architecture est prête** pour être appliquée aux vraies plateformes d'assurance.

---

## 🤝 Support

Pour toute question sur le produit Premium :
1. Consulter ce README
2. Lire les commentaires dans le code
3. Examiner les tests pour des exemples d'utilisation
