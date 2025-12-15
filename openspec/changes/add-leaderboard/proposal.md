# Change: Ajouter un leaderboard des 200 meilleurs joueurs

## Why
Permettre aux utilisateurs de consulter le classement des 200 meilleurs joueurs Hearthstone directement depuis l'application, pour suivre les performances des meilleurs joueurs de la communauté.

## What Changes
- Création d'un nouveau service `LeaderboardService` pour récupérer les données du leaderboard via l'API Blizzard
- Création d'un composant `LeaderboardComponent` avec une interface moderne et responsive
- Ajout d'un lien "Leaderboard" dans la navbar avec navigation vers `/leaderboard`
- Filtres disponibles : région (EU, US, AP), mode de jeu (Standard, Wild, Battlegrounds, etc.)
- Affichage des 200 premiers joueurs avec leur rang et leur nom

## Impact
- Affected specs: navbar, leaderboard (nouveau)
- Affected code:
  - `frontend/src/app/services/leaderboard.service.ts` (nouveau)
  - `frontend/src/app/components/leaderboard/` (nouveau)
  - `frontend/src/app/components/navbar/navbar.component.html`
  - `frontend/src/app/components/navbar/navbar.component.ts`
  - `frontend/src/app/app.routes.ts`

## API Details
- **Endpoint**: `https://hearthstone.blizzard.com/en-us/api/community/leaderboardsData`
- **Paramètres**:
  - `region`: US, EU, AP
  - `leaderboardId`: standard, wild, battlegrounds, battlegroundsduo, arena, classic, twist, mercenaries
  - `seasonId`: ID de la saison courante
- **Réponse**: Liste des joueurs avec `accountid`, `rank`, `rating`

## UI/UX
- Design cohérent avec le thème Hearthstone existant
- Tableau scrollable avec les rangs, noms des joueurs
- Sélecteurs de région et mode de jeu avec style assorti
- Indicateurs de chargement et gestion des erreurs
- Médailles or/argent/bronze pour le top 3
