# SPEC: Deck Dust Statistics

## ADDED Requirements

### Requirement: Display Total Dust Cost
MUST display the total dust cost of the deck.

#### Scenario: User views a deck in the Deck Builder
Given the user is in the Deck Builder view,
When a deck is loaded or modified,
Then the total dust cost of the deck shall be displayed.

### Requirement: Display Dust Cost Breakdown by Rarity
MUST display the dust cost breakdown by each rarity.

#### Scenario: User views a deck in the Deck Builder with various rarities
Given the user is in the Deck Builder view,
And the loaded deck contains cards of different rarities (Common, Rare, Epic, Legendary),
When the dust cost is calculated,
Then the dust cost breakdown by each rarity shall be displayed.

### Requirement: Visual Representation of Dust Breakdown
MUST present a visual representation (e.g., a chart) of the dust cost distribution across rarities.

#### Scenario: User views the dust cost breakdown
Given the dust cost breakdown by rarity is available,
When the user views the Deck Builder,
Then a visual representation (e.g., a chart) of the dust cost distribution across rarities shall be presented.

### Requirement: Accurate Dust Value Mapping
MUST use fixed dust values based on `rarityId` when calculating a card's dust contribution, and MUST treat unknown or invalid `rarityId` values as 0 dust.

#### Scenario: Card rarity is identified
Given a card with a specific `rarityId` is processed,
When calculating its dust contribution,
Then the following fixed dust values shall be used:
- `rarityId` corresponding to Common: 40 dust
- `rarityId` corresponding to Rare: 100 dust
- `rarityId` corresponding to Epic: 400 dust
- `rarityId` corresponding to Legendary: 1600 dust

#### Scenario: Handling unknown rarity
Given a card with an unknown or invalid `rarityId` is encountered,
When calculating its dust contribution,
Then it shall be treated as 0 dust and optionally logged as a warning.
