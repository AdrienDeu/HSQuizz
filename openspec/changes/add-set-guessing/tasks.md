# Tasks: Ajouter la possibilité de deviner l'extension

## Implementation Checklist

### 1. Modèle de données
- [x] Ajouter `'set'` au type `HiddenAttribute` dans `card.model.ts`
- [x] Ajouter le label "Extension" dans `HIDDEN_ATTRIBUTE_LABELS`

### 2. Service Quiz
- [x] Ajouter le case `'set'` dans `getAnswerPlaceholder()` de `quiz.service.ts`
- [x] Ajouter le case `'set'` dans `getAttributeValue()` pour retourner la traduction
- [x] Ajouter la logique de vérification pour accepter code ET traduction dans `checkAnswer()`
- [x] Ajouter la méthode `translateSet()` dans `card.service.ts`

### 3. Tests manuels
- [ ] Vérifier que l'option "Extension" apparaît dans le sélecteur
- [ ] Vérifier qu'on peut jouer avec l'extension comme attribut à deviner
- [ ] Vérifier que les réponses traduites sont acceptées
- [ ] Vérifier que les codes originaux sont acceptés

## Dependencies

- Aucune nouvelle dépendance requise
- Utilise les traductions existantes dans `SET_TRANSLATIONS`

## Estimated Effort

~15 minutes de développement
