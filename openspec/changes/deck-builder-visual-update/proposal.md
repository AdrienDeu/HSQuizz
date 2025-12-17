# Proposition de changement : Amélioration visuelle du créateur de decks

## Description

Cette proposition vise à améliorer l'interface utilisateur du créateur de decks en remplaçant les éléments fictifs par de véritables illustrations et icônes du jeu Hearthstone.

Les changements proposés sont les suivants :

1.  **Affichage des illustrations de cartes** : Remplacer les cartes génériques actuellement affichées dans la collection par les illustrations réelles des cartes Hearthstone.
2.  **Utilisation des logos de classe réels** : Remplacer les icônes de classe textuelles ou fictives par les logos officiels des classes de Hearthstone.

## Motivation

L'objectif est de rendre le créateur de decks plus immersif, visuellement attrayant et plus proche de l'expérience en jeu. L'utilisation d'éléments graphiques authentiques améliorera considérablement l'expérience utilisateur et la convivialité de l'outil.

## Fichiers impactés (estimation)

-   `frontend/src/app/components/deck-builder/card-collection/card-collection.component.html`
-   `frontend/src/app/components/deck-builder/card-collection/card-collection.component.ts`
-   `frontend/src/app/components/deck-builder/card-collection/card-collection.component.scss`
-   `frontend/src/app/components/deck-builder/deck-manager/deck-manager.component.html`
-   `frontend/src/app/components/deck-builder/deck-manager/deck-manager.component.ts`
-   `frontend/src/app/models/card.model.ts` (potentiellement pour ajouter les URLs des images si nécessaire)
-   `frontend/src/app/services/card.service.ts` (potentiellement pour gérer la récupération des nouvelles données)

## Stratégie d'implémentation proposée

1.  **Illustrations des cartes** :
    -   Modifier le composant `card-collection` pour afficher une image de la carte.
    -   Utiliser une source d'images externe ou locale pour les illustrations de cartes, comme par exemple `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/{CardID}.png`.
    -   Adapter le style pour que les cartes s'affichent correctement dans une grille.

2.  **Logos des classes** :
    -   Récupérer les logos des classes de Hearthstone (par exemple, depuis un CDN ou en les ajoutant au projet).
    -   Modifier le composant `deck-manager` pour afficher ces logos à la place du texte actuel lors de la sélection de la classe.
-   Mettre à jour le `card.service.ts` pour inclure une méthode qui mappe les noms de classe aux URLs de leurs logos.
