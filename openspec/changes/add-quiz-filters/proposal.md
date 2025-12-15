# Change: Ajouter des filtres de quiz (extension et attribut à deviner)

## Why
Permettre aux utilisateurs de personnaliser leur expérience de quiz en filtrant les cartes par extension Hearthstone et en choisissant quel attribut de carte ils souhaitent deviner (nom, classe, coût, etc.).

## What Changes
- Ajout d'un sélecteur d'extension(s) pour filtrer les cartes du quiz
- Ajout d'un sélecteur d'attribut à deviner (nom, classe, coût, attaque, vie, rareté)
- Création d'un panneau de configuration du quiz accessible avant de commencer
- Mise à jour du service de cartes pour supporter le filtrage par extension
- Mise à jour du service de quiz pour gérer l'attribut à deviner dynamiquement

## Impact
- Affected specs: quiz (nouveau)
- Affected code:
  - `frontend/src/app/services/card.service.ts` - ajout filtrage par set
  - `frontend/src/app/services/quiz.service.ts` - gestion attribut dynamique
  - `frontend/src/app/components/quiz/quiz.component.ts` - logique de configuration
  - `frontend/src/app/components/quiz/quiz.component.html` - UI de configuration
  - `frontend/src/app/models/card.model.ts` - types pour les filtres
  - Nouveau composant: `quiz-settings` (optionnel)
