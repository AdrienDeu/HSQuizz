# Tasks: Add Deck Dust Statistics to Deck Builder

This document outlines the tasks required to implement the deck dust statistics feature in the Deck Builder.

## Implementation Tasks

1.  **Understand Card Data Structure:**
    *   Inspect `frontend/src/app/models/card.model.ts` to confirm `rarityId` and other relevant properties.
    *   Verify the availability of `rarityId` in the `hearthstone_cards.json` data.

2.  **Define Dust Values:**
    *   Create a constant mapping `rarityId` to dust values (Common: 40, Rare: 100, Epic: 400, Legendary: 1600). This can be in a utility file or a dedicated service.

3.  **Implement Dust Calculation Service/Logic:**
    *   Develop a service (e.g., `DustCalculatorService`) or extend `DeckBuilderService` to calculate the total dust cost of a given deck.
    *   The calculation should also provide a breakdown by rarity.
    *   Add unit tests for the dust calculation logic.

4.  **Integrate Charting Library (Chart.js):**
    *   Install Chart.js and its Angular wrapper (if available and preferred).
    *   Create a new component (e.g., `DustChartComponent`) to encapsulate the chart rendering logic.

5.  **Update Deck Builder Component:**
    *   Modify `frontend/src/app/components/deck-builder/deck-builder.component.ts` to:
        *   Inject the `DustCalculatorService`.
        *   Call the dust calculation logic whenever the deck changes.
        *   Pass the calculated dust statistics to the `DustChartComponent`.
    *   Modify `frontend/src/app/components/deck-builder/deck-builder.component.html` to:
        *   Include the `DustChartComponent`.
        *   Display the total dust cost and a textual breakdown.

6.  **Develop Dust Chart Component (`DustChartComponent`):**
    *   Implement the `DustChartComponent` to receive dust statistics as input.
    *   Render a chart (e.g., a pie chart or bar chart) using Chart.js to visualize the rarity breakdown.
    *   Display the total dust cost prominently.

7.  **Styling and UI/UX:**
    *   Apply appropriate styling to integrate the dust statistics seamlessly into the existing Deck Builder UI (`deck-builder.component.scss`, `dust-chart.component.scss`).
    *   Ensure responsiveness and good user experience.

8.  **End-to-End Testing:**
    *   Manually test the feature in the browser.
    *   Consider adding e2e tests to verify the dust calculation and display.
