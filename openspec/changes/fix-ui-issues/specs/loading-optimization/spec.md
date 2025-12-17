# Loading State Optimization Spec Delta

## MODIFIED Requirements

### Requirement: Localize loading feedback for uncollectible items
The loading feedback for actions such as "Include uncollectible items" SHALL be localized to the specific UI components affected, preventing the entire page from being obscured or disabled.
#### Scenario: Loading feedback for "Include uncollectible items" should be localized
When the user opts to "Include uncollectible items" (previously "inclure les éléments non-collectionnables") and new data is being fetched or processed, the visual feedback (e.g., grayscaling, loading spinner) should be confined to the specific section or component where the loading is occurring (e.g., the card display area or the filter controls), not the entire application viewport.

#### Scenario: Interactive elements outside the loading scope should remain usable
During the loading process triggered by including uncollectible items, any interactive elements or sections of the UI that are not directly affected by the data refresh should remain fully functional and responsive.
