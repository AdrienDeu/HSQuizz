# Quiz Feature Specification

## ADDED Requirements

### Requirement: Filtrage par extension
The system SHALL allow users to filter quiz cards by Hearthstone expansion(s). Le système DOIT permettre à l'utilisateur de filtrer les cartes du quiz par extension(s) Hearthstone.

#### Scenario: Sélection d'une seule extension
- **WHEN** l'utilisateur sélectionne une extension (ex: "TITANS")
- **THEN** seules les cartes de cette extension sont utilisées dans le quiz

#### Scenario: Sélection de plusieurs extensions
- **WHEN** l'utilisateur sélectionne plusieurs extensions
- **THEN** les cartes de toutes les extensions sélectionnées sont utilisées dans le quiz

#### Scenario: Aucune extension sélectionnée
- **WHEN** l'utilisateur ne sélectionne aucune extension ou sélectionne "Toutes"
- **THEN** toutes les cartes collectibles sont utilisées dans le quiz

#### Scenario: Affichage des extensions disponibles
- **WHEN** l'utilisateur ouvre le sélecteur d'extensions
- **THEN** la liste affiche les extensions avec leurs noms traduits en français
- **AND** les extensions sont triées par ordre alphabétique

### Requirement: Choix de l'attribut à deviner
The system SHALL allow users to choose which card attribute to guess. Le système DOIT permettre à l'utilisateur de choisir l'attribut de la carte qu'il doit deviner.

#### Scenario: Sélection de l'attribut "Nom"
- **WHEN** l'utilisateur sélectionne "Nom de la carte" comme attribut à deviner
- **THEN** le quiz masque le nom de la carte et demande à l'utilisateur de le deviner

#### Scenario: Sélection de l'attribut "Classe"
- **WHEN** l'utilisateur sélectionne "Classe" comme attribut à deviner
- **THEN** le quiz masque la classe de la carte
- **AND** l'utilisateur doit deviner la classe (Mage, Guerrier, Neutre, etc.)

#### Scenario: Sélection de l'attribut "Coût"
- **WHEN** l'utilisateur sélectionne "Coût en mana" comme attribut à deviner
- **THEN** le quiz masque le coût de la carte
- **AND** l'utilisateur doit deviner le coût en mana

#### Scenario: Sélection de l'attribut "Attaque"
- **WHEN** l'utilisateur sélectionne "Attaque" comme attribut à deviner
- **THEN** le quiz masque l'attaque de la carte (pour les serviteurs/armes)
- **AND** seules les cartes avec une valeur d'attaque sont proposées

#### Scenario: Sélection de l'attribut "Vie"
- **WHEN** l'utilisateur sélectionne "Points de vie" comme attribut à deviner
- **THEN** le quiz masque les points de vie de la carte (pour les serviteurs)
- **AND** seules les cartes avec des points de vie sont proposées

#### Scenario: Sélection de l'attribut "Rareté"
- **WHEN** l'utilisateur sélectionne "Rareté" comme attribut à deviner
- **THEN** le quiz masque la rareté de la carte
- **AND** l'utilisateur doit deviner la rareté (Commune, Rare, Épique, Légendaire)

### Requirement: Interface de configuration du quiz
The system SHALL display a configuration interface before starting the quiz. Le système DOIT afficher une interface de configuration avant le démarrage du quiz.

#### Scenario: Affichage initial de la configuration
- **WHEN** l'utilisateur accède au quiz
- **THEN** l'interface de configuration s'affiche avec:
  - Un sélecteur d'extension(s)
  - Un sélecteur d'attribut à deviner
  - Un bouton "Démarrer le quiz"

#### Scenario: Démarrage du quiz après configuration
- **WHEN** l'utilisateur clique sur "Démarrer le quiz"
- **THEN** le quiz démarre avec les paramètres sélectionnés
- **AND** l'interface de configuration est masquée
- **AND** les paramètres actuels sont affichés pendant le quiz

#### Scenario: Retour à la configuration
- **WHEN** l'utilisateur clique sur "Modifier les paramètres" pendant le quiz
- **THEN** l'interface de configuration s'affiche à nouveau
- **AND** les statistiques du quiz en cours sont réinitialisées

### Requirement: Affichage du mode de jeu
The system SHALL display the current game mode during the quiz. Le système DOIT afficher le mode de jeu actuel pendant le quiz.

#### Scenario: Affichage des paramètres actifs
- **WHEN** le quiz est en cours
- **THEN** l'interface affiche:
  - L'extension ou les extensions sélectionnées
  - L'attribut à deviner
  - Le nombre de cartes disponibles dans la sélection

### Requirement: Filtrage intelligent des cartes selon l'attribut
The system SHALL filter cards appropriately based on the selected attribute. Le système DOIT filtrer les cartes de manière appropriée selon l'attribut à deviner.

#### Scenario: Attribut "Attaque" sélectionné
- **WHEN** l'attribut à deviner est "Attaque"
- **THEN** seules les cartes ayant une valeur d'attaque (serviteurs, armes) sont utilisées

#### Scenario: Attribut "Vie" sélectionné
- **WHEN** l'attribut à deviner est "Vie"
- **THEN** seules les cartes ayant des points de vie (serviteurs) sont utilisées

#### Scenario: Attribut "Rareté" sélectionné
- **WHEN** l'attribut à deviner est "Rareté"
- **THEN** seules les cartes ayant une rareté définie sont utilisées
