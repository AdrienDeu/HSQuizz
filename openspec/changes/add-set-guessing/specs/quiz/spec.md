# Quiz Capability - Delta Spec

## ADDED Requirements

### Requirement: REQ-QUIZ-SET-001 Extension comme attribut devinable

Le système SHALL permettre de sélectionner "Extension" comme attribut à deviner dans le quiz.

#### Scenario: Sélection de l'extension comme mode de jeu
- **Given** l'utilisateur est sur l'écran de configuration du quiz
- **When** il sélectionne "Extension" dans le menu déroulant des attributs
- **Then** le quiz démarre avec l'extension masquée sur chaque carte

### Requirement: REQ-QUIZ-SET-002 Affichage de l'extension traduite

Le système SHALL afficher le nom traduit en français de l'extension comme réponse correcte.

#### Scenario: Affichage de la bonne réponse
- **Given** une question avec l'extension "TITANS" à deviner
- **When** l'utilisateur révèle la réponse ou répond incorrectement
- **Then** le système affiche "Les Titans" comme réponse correcte

### Requirement: REQ-QUIZ-SET-003 Validation des réponses multiformats

Le système SHALL accepter comme réponse correcte :
1. Le nom traduit en français (ex: "Les Titans")
2. Le code original de l'extension (ex: "TITANS")

#### Scenario: Réponse avec traduction française
- **Given** une question avec l'extension "TITANS" à deviner
- **When** l'utilisateur répond "Les Titans"
- **Then** la réponse est marquée comme correcte

#### Scenario: Réponse avec code original
- **Given** une question avec l'extension "TITANS" à deviner
- **When** l'utilisateur répond "TITANS"
- **Then** la réponse est marquée comme correcte

#### Scenario: Réponse insensible à la casse
- **Given** une question avec l'extension "TITANS" à deviner
- **When** l'utilisateur répond "titans" ou "les titans"
- **Then** la réponse est marquée comme correcte

## MODIFIED Requirements

### Requirement: REQ-QUIZ-ATTR-001 Liste des attributs devinables

Le type `HiddenAttribute` SHALL inclure les valeurs suivantes :
- `name` - Name of the card
- `cardClass` - Class
- `cost` - Mana cost
- `attack` - Attack
- `health` - Health
- `rarity` - Rarity
- `set` - Set

#### Scenario: Options disponibles dans le sélecteur
- **Given** l'utilisateur est sur l'écran de configuration
- **When** il ouvre le menu de sélection d'attribut
- **Then** il voit 7 options incluant "Extension"
