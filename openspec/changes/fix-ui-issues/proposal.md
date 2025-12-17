# Proposal: UI/UX Improvements

## Overview
This proposal addresses several UI/UX issues identified in the application, focusing on language consistency, visual cleanliness, performance feedback, and quiz integrity. The goal is to enhance the user experience by streamlining information presentation and ensuring core functionalities behave as expected.

## Motivation
The current application exhibits inconsistencies and areas for improvement:
1.  **Language Mix:** A blend of French and English is present in the UI, which can be confusing. Given that card data is in English, the UI should ideally align with a single language or provide clear localization options. This proposal aims to standardize on English for core UI elements where possible, while acknowledging the user's initial request in French. However, the primary goal is *consistency*. If the application is intended for a French-speaking audience, all UI elements should be translated to French. I will assume the user wants the UI to be consistent with the card data (English), but will confirm this if ambiguity arises.
2.  **Excessive Emojis:** Some pages may contain an abundance of emojis, which can detract from a professional appearance and potentially impact readability. The request is to minimize these.
3.  **Loading State for Non-Collectible Items:** When "include non-collectible items" is selected, the entire page grays out during loading, leading to a suboptimal user experience. This loading feedback needs to be scoped more narrowly.
4.  **Quiz Card Display:** During the quiz, displaying the card directly provides an immediate answer, defeating the purpose of the quiz. The card image should be hidden until the answer is revealed.

## Proposed Changes
This change set will introduce modifications across different parts of the frontend to address the identified issues:
*   **Language Consistency:** Review and unify the language used in UI elements.
*   **Emoji Reduction:** Identify and remove or minimize excessive emoji usage.
*   **Loading State Optimization:** Refine the loading feedback mechanism when fetching non-collectible cards to only gray out or disable the relevant interactive components instead of the entire page.
*   **Quiz Card Hiding:** Implement logic to prevent the card image from being visible during the question phase of the quiz.

## High-Level Plan
1.  **Assessment:** Conduct a thorough review of the frontend codebase to identify all instances related to the issues.
2.  **Refinement:** Implement targeted changes in HTML templates, CSS, and TypeScript components to achieve the desired outcomes.
3.  **Testing:** Ensure all changes are functional, do not introduce regressions, and meet the specified requirements.

## Impact
These changes are expected to improve the overall polish and usability of the application without altering core functionalities. The user experience will be more consistent, visually cleaner, and the quiz more effective.