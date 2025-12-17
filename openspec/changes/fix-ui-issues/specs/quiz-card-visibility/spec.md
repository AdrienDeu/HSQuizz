# Quiz Card Visibility Spec Delta

## MODIFIED Requirements

### Requirement: Hide card image during quiz question phase
The card image MUST NOT be displayed during the initial question phase of the quiz to prevent immediate revelation of the answer and ensure the quiz's challenge.
#### Scenario: Card image should be hidden during the quiz question phase
During the quiz, when a question is presented to the user, the image of the card should not be immediately visible. Displaying the card image prematurely provides the answer directly and bypasses the quiz's intent.

#### Scenario: Card image should be revealed only after the user requests it or attempts an answer
The card image should only become visible once the user has submitted an answer, made a selection, or explicitly requested to reveal the answer. This ensures the quiz functions as an actual test of knowledge.
