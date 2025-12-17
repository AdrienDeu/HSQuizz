# Proposition de changement : Remplacement des Emojis et Simplification Visuelle

## Description

Cette proposition vise à améliorer l'interface utilisateur en remplaçant tous les emojis par des icônes de jeu authentiques et en simplifiant l'affichage des cartes dans le constructeur de deck.

Les changements proposés sont les suivants :

1.  **Remplacement des Emojis par des Icônes de Héros/Pouvoirs Héroïques** : Partout dans l'application, les emojis utilisés comme icônes (par exemple, pour le tri, les actions de deck, etc.) seront remplacés par de vraies icônes de Hearthstone, comme les icônes de pouvoirs héroïques ou de classes, pour une meilleure cohérence visuelle.
2.  **Affichage Simplifié dans la Collection de Decks** : Dans la vue de collection du constructeur de deck, seul l'artwork (l'illustration) de la carte sera affiché. Toutes les informations superflues comme le nom, le coût, etc., seront retirées pour ne laisser que l'image cliquable.

## Motivation

L'objectif est de professionnaliser l'apparence de l'application et de la rendre plus épurée et intuitive.
-   Le remplacement des emojis par des icônes de jeu renforcera l'immersion et la cohérence thématique.
-   La simplification de l'affichage des cartes dans le constructeur de deck permettra une navigation plus rapide et moins encombrée, se concentrant uniquement sur l'aspect visuel des cartes, ce qui est souvent suffisant pour les joueurs expérimentés.

## Fichiers impactés (estimation)

-   `frontend/src/app/components/deck-builder/deck-manager/deck-manager.component.html`
-   `frontend/src/app/components/deck-builder/deck-manager/deck-manager.component.scss`
-   `frontend/src/app/components/deck-builder/deck-card-item/deck-card-item.component.html`
-   `frontend/src/app/components/deck-builder/deck-card-item/deck-card-item.component.scss`
-   `frontend/src/app/services/card.service.ts` (potentiellement pour ajouter un mapping vers les nouvelles icônes)

## Stratégie d'implémentation proposée

1.  **Remplacement des Emojis** :
    -   Identifier tous les endroits où des emojis sont utilisés comme icônes.
    -   Rechercher et trouver des icônes SVG ou PNG appropriées pour chaque action (trier, supprimer, charger, renommer, etc.). Le dépôt `HearthSim/hs-icons` pourrait être une bonne source.
    -   Remplacer les emojis texte par des balises `<img>` ou des `background-image` CSS.
    -   Ajuster le style pour que les nouvelles icônes s'intègrent harmonieusement.

2.  **Simplification de l'affichage des cartes** :
    -   Modifier `frontend/src/app/components/deck-builder/deck-card-item/deck-card-item.component.html` pour ne conserver que l'élément racine avec l'image de fond.
    -   Supprimer les superpositions de coût et de nom de la carte.
    -   Ajuster `frontend/src/app/components/deck-builder/deck-card-item/deck-card-item.component.scss` pour enlever les styles associés aux éléments supprimés, en ne gardant que le style de base de la carte (taille, bordure, effet de survol).
