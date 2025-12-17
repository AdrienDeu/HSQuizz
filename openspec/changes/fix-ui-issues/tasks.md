# Tasks

This document outlines the tasks required to implement the UI/UX improvements proposed in `proposal.md`.

## Language Consistency
1.  **Identify mixed language elements:** Search the frontend codebase for UI text that is a mix of French and English, focusing on labels, button texts, and instructions.
2.  **Standardize language:** Convert all identified mixed-language UI elements to English, given that card data is in English. (Further discussion with user needed if French is the desired primary UI language).

## Emoji Reduction
1.  **Audit emoji usage:** Go through all frontend components (`.html` and `.ts` files) to locate explicit emoji characters or emoji-rendering components.
2.  **Remove/Minimize emojis:** For each identified emoji, evaluate its necessity. Remove unnecessary emojis and minimize others where their presence is truly beneficial.

## Loading State Optimization ("Inclure les éléments non-collectionnables")
1.  **Locate the "inclure les éléments non-collectionnables" feature:** Find the component responsible for triggering the loading of non-collectible items and its associated loading state management.
2.  **Isolate loading overlay:** Modify the CSS/component logic to ensure that the loading overlay/grayscale effect only applies to the specific section or component that is loading, rather than the entire page. This might involve using a more targeted loading indicator or disabling only the relevant input elements.

## Quiz Card Hiding
1.  **Identify quiz component:** Locate the `quiz.component.html` and `quiz.component.ts` files.
2.  **Implement conditional card display:** Add logic to `quiz.component.ts` and `quiz.component.html` to hide the card image (e.g., using `*ngIf` or `[hidden]`) during the question phase of the quiz. The card should only become visible after the user attempts an answer or requests to reveal it.

## Verification
1.  **Manual UI review:** Navigate through the application to confirm language consistency, reduced emoji count, improved loading state feedback, and correct quiz behavior.
2.  **Unit/Integration tests:** Add or update relevant tests to cover the new display logic for the quiz component and ensure loading state changes behave as expected.
3.  **Cross-browser compatibility check:** (If applicable) Verify changes render correctly across supported browsers.
