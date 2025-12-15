## MODIFIED Requirements

### Requirement: Navigation Links
Le système DOIT fournir des liens de navigation dans la barre de navigation.

#### Scenario: Affichage du lien Leaderboard
- **WHEN** l'utilisateur visualise la navbar
- **THEN** un lien "Leaderboard" avec une icône 🏆 est visible
- **AND** le lien permet de naviguer vers `/leaderboard`

#### Scenario: Navigation vers le leaderboard
- **WHEN** l'utilisateur clique sur le lien "Leaderboard"
- **THEN** l'application navigue vers la page du leaderboard
