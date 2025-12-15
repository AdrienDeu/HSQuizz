# Proposal: Ajouter la possibilité de deviner l'extension

## Summary

Permettre aux joueurs de deviner l'extension (set) d'une carte Hearthstone dans le quiz, en plus des attributs existants (nom, classe, coût, attaque, vie, rareté).

## Motivation

Actuellement, le quiz permet de deviner 6 attributs différents d'une carte. L'extension est une information importante pour les joueurs expérimentés qui connaissent bien l'historique du jeu. Ajouter cette option enrichit l'expérience et permet de tester les connaissances sur les différentes extensions de Hearthstone.

## Goals

1. Ajouter `set` comme nouvel attribut devinable dans le type `HiddenAttribute`
2. Permettre aux utilisateurs de sélectionner "Extension" dans les paramètres du quiz
3. Afficher le nom traduit de l'extension comme réponse correcte
4. Accepter les réponses en français (traductions existantes dans `SET_TRANSLATIONS`)

## Non-Goals

- Modifier le système de filtrage par extension existant
- Ajouter d'autres nouveaux attributs devinables

## Design Overview

### Modifications du modèle

Le type `HiddenAttribute` sera étendu pour inclure `'set'` :
```typescript
export type HiddenAttribute = 'name' | 'cardClass' | 'cost' | 'attack' | 'health' | 'rarity' | 'set';
```

### Modifications du service

Le `QuizService` sera mis à jour pour :
- Gérer le placeholder pour l'extension
- Retourner la valeur traduite de l'extension
- Vérifier les réponses en acceptant le code original ET la traduction française

### Impact UI

Aucune modification majeure nécessaire - l'option "Extension" apparaîtra automatiquement dans le sélecteur d'attributs grâce à `HIDDEN_ATTRIBUTE_LABELS`.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Extensions non traduites | Certaines extensions pourraient ne pas avoir de traduction | Les traductions existent déjà dans `SET_TRANSLATIONS` |
| Noms d'extensions longs | Difficulté pour les utilisateurs | Accepter des réponses partielles ou les codes originaux |

## Success Criteria

- [ ] L'option "Extension" est disponible dans le sélecteur d'attributs
- [ ] La réponse correcte affiche le nom traduit de l'extension
- [ ] Le système accepte la traduction française comme réponse valide
- [ ] Le système accepte également le code original (ex: "TITANS") comme réponse valide
