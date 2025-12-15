## ADDED Requirements

### Requirement: Leaderboard Display
Le système DOIT afficher un tableau des 200 meilleurs joueurs Hearthstone.

#### Scenario: Affichage initial du leaderboard
- **WHEN** l'utilisateur accède à la page `/leaderboard`
- **THEN** le système charge et affiche les 200 meilleurs joueurs de la région EU en mode Standard par défaut
- **AND** chaque entrée affiche le rang et le nom du joueur

#### Scenario: Filtrage par région
- **WHEN** l'utilisateur sélectionne une région (EU, US, AP)
- **THEN** le système recharge les données du leaderboard pour la région sélectionnée

#### Scenario: Filtrage par mode de jeu
- **WHEN** l'utilisateur sélectionne un mode de jeu (Standard, Wild, Battlegrounds, etc.)
- **THEN** le système recharge les données du leaderboard pour le mode sélectionné

### Requirement: Leaderboard Loading States
Le système DOIT gérer les états de chargement et d'erreur.

#### Scenario: Chargement en cours
- **WHEN** les données du leaderboard sont en cours de chargement
- **THEN** le système affiche un indicateur de chargement

#### Scenario: Erreur de chargement
- **WHEN** le chargement des données échoue
- **THEN** le système affiche un message d'erreur approprié
- **AND** propose un bouton pour réessayer

### Requirement: Leaderboard Visual Design
Le système DOIT avoir un design cohérent avec le thème Hearthstone.

#### Scenario: Mise en avant du top 3
- **WHEN** le leaderboard est affiché
- **THEN** les joueurs en position 1, 2, 3 sont mis en évidence avec des médailles or, argent, bronze

#### Scenario: Responsive design
- **WHEN** l'utilisateur consulte le leaderboard sur mobile
- **THEN** l'interface s'adapte à la taille de l'écran
