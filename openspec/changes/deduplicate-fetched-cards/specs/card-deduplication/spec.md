# Card Deduplication Specification

## ADDED Requirements

### Requirement: Deduplicate Card Entries

The system SHALL deduplicate card entries fetched from the data source, retaining only one canonical version of each unique card.

#### Scenario: Basic Deduplication

Given a list of fetched cards containing multiple entries for the same logical card (e.g., identical `dbfId` but different `id`s or versions),
When the card data is processed,
Then only one entry for that logical card SHALL be present in the final collection.

#### Scenario: Prioritize Latest Version

Given a list of fetched cards containing multiple entries for the same logical card, where each entry might represent a different version or set,
When the card data is processed,
Then the entry identified as the "latest version" SHALL be retained, and older or less relevant versions SHALL be discarded.

#### Scenario: Handling Missing Version Information

Given a list of fetched cards where some duplicate entries lack clear versioning information,
When the card data is processed,
Then the system SHALL use a predefined fallback mechanism (e.g., prioritizing `collectible` cards, or an arbitrary consistent choice) to select the retained card.

### Requirement: Define Card Uniqueness Key

The system SHALL define a clear and consistent key for identifying unique cards during the deduplication process.

#### Scenario: `dbfId` as Primary Key

Given that `dbfId` is identified as the most stable unique identifier for a card across versions,
When deduplication occurs,
Then cards with the same `dbfId` SHALL be considered logical duplicates.

### Requirement: Define Latest Version Prioritization Logic

The system SHALL implement a prioritization logic to determine which version of a duplicate card to retain.

#### Scenario: Prioritizing Collectible Cards

Given two duplicate cards (same `dbfId`), where one is `collectible` and the other is not,
When the prioritization logic is applied,
Then the `collectible` card SHALL be retained.

#### Scenario: Prioritizing by Set/Expansion

Given two duplicate cards (same `dbfId`), both `collectible`, but from different sets/expansions,
When the prioritization logic is applied,
Then the card from the most recently released set (if identifiable) SHALL be retained.
If set release order is not easily determinable, a consistent arbitrary choice (e.g., alphabetically by set name, or the one appearing first in the original data) SHALL be made.

## MODIFIED Requirements

*(None initially, as this is a new feature)*

## REMOVED Requirements

*(None initially, as this is a new feature)*