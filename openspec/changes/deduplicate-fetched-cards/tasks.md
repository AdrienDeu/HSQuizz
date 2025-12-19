# Deduplicate Fetched Cards Tasks

## Phase 1: Investigation and Planning

- [x] **Task 1: Identify Card Data Source and Processing Flow**
    *   Examine `frontend/public/hearthstone_cards.json` and any related services (e.g., `card.service.ts`) to understand how card data is loaded and processed.
    *   Determine the most appropriate place in the data pipeline to perform deduplication.
    *   *Verification*: Document the data loading flow and identified insertion point.
- [x] **Task 2: Define Card Uniqueness and Versioning Criteria**
    *   Consult with stakeholders (or make an informed decision based on data structure) to establish the primary key for card uniqueness (e.g., `dbfId`, `id`, `name`).
    *   Define how the "latest version" of a card will be determined when duplicates are found (e.g., `set` priority, `collectible` status, a specific version field if available).
    *   *Verification*: Document the chosen uniqueness and versioning criteria.

## Phase 2: Implementation

- [x] **Task 3: Implement Deduplication Logic**
    *   Develop a utility function or method that takes an array of cards and returns a deduplicated array based on the defined criteria.
    *   The logic should prioritize the latest card version.
    *   *Verification*: Unit tests for the deduplication function covering various scenarios (no duplicates, exact duplicates, duplicates with different versions).
- [x] **Task 4: Integrate Deduplication into Card Loading**
    *   Modify the relevant card loading service or component to apply the deduplication logic after fetching raw card data but before it's used elsewhere in the application.
    *   *Verification*: End-to-end testing to ensure card data is correctly deduplicated in the application.

## Phase 3: Testing and Validation

- [ ] **Task 5: Update Existing Tests (if any)**
    *   Review and update any existing tests that rely on card data to ensure they still pass with deduplicated data.
    *   *Verification*: All relevant unit and integration tests pass.
- [ ] **Task 6: Manual Verification**
    *   Manually inspect the card collection in the application to confirm that no duplicate cards are present and that the correct versions are displayed.
    *   *Verification*: Visual confirmation of deduplicated cards in the UI.

## Dependencies

*   Agreement on card uniqueness and versioning criteria (Task 2).
*   Functional card data loading mechanism.