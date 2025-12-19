# Deduplicate Fetched Cards Proposal

## Problem

Currently, the application may fetch duplicate card entries, potentially from different versions or sets, leading to an inconsistent and bloated card collection. This can impact performance, user experience, and data accuracy.

## Proposal

This proposal introduces a mechanism to deduplicate fetched card data, ensuring that only one canonical version of each card is retained. The primary goal is to keep the most recent or relevant version of a card when duplicates are encountered.

## Capabilities

*   **Card Deduplication**: Implement logic to identify and remove duplicate card entries from the fetched data. When duplicates exist, the most up-to-date version of the card will be prioritized and retained.

## Rationale

Deduplicating cards will:
*   Improve data integrity and consistency.
*   Reduce memory footprint and improve application performance.
*   Enhance the user experience by presenting a clean and accurate card collection.
*   Simplify downstream logic that processes card data.

## High-Level Plan

1.  Identify the source(s) of fetched card data and the point at which deduplication should occur.
2.  Define criteria for identifying duplicate cards (e.g., card ID, name, set, version).
3.  Implement a deduplication strategy that prioritizes the latest version of a card.
4.  Integrate the deduplication logic into the card data processing pipeline.

## Open Questions / Dependencies

*   What specific fields should be used to uniquely identify a card for deduplication purposes? (e.g., `dbfId`, `id`, `name`)
*   How should "latest version" be determined? (e.g., based on `card set`, `release date`, or a specific versioning field)
*   Are there existing utility functions or services that handle card data loading that can be modified?