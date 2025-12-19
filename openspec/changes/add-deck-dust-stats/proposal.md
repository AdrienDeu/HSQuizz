# Proposal: Add Deck Dust Statistics to Deck Builder

## Overview
This proposal aims to enhance the Deck Builder by providing immediate visual statistics regarding the "Dust Cost" of a deck. This feature will help users understand the crafting cost of their decks, differentiating between rarity components.

## Motivation
Currently, users can build decks but lack insight into the material cost required to craft them. Adding dust cost statistics will enrich the Deck Builder's utility, enabling more informed decision-making for players, especially those with limited dust resources.

## Proposed Changes
- **Dust Cost Calculation:** Implement logic to calculate the total dust cost of a deck based on the rarity of each card.
- **Rarity Breakdown:** Display the dust cost broken down by card rarity (e.g., Common, Rare, Epic, Legendary).
- **Visual Representation:** Utilize a JavaScript charting library (e.g., Chart.js) to provide a clear and intuitive visual representation of the dust distribution and total cost.

## API Integration
The Blizzard API already provides `rarityId` for each card, which will be used to determine the dust value.
Fixed dust values per rarity will be:
- Common: 40 dust
- Rare: 100 dust
- Epic: 400 dust
- Legendary: 1600 dust
