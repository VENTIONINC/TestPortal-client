## Why

Client #105 lets users inspect scenarios covering a Result's Spec, but they cannot manage those links while investigating a failure. Client #109 adds explicit link and unlink actions using the existing project-local TestScenario–Spec association.

## What Changes

- Add Link Test Scenario to successful empty and populated Test Scenarios views in the existing Result modal.
- Provide an in-pane picker of existing project scenarios with scenario key (`N/A` fallback), title, nullable details, server search and pagination.
- Search title and scenarioKey using the served contract. Details search is explicitly excluded by the agreed scope; this narrows the original #109 wording without requiring a backend expansion.
- Link using the selected Result detail's Spec UUID; provide explicit unlink confirmation explaining that coverage changes for all past and future Results of that Spec.
- Refresh authoritative detail and link caches, handle duplicate conflicts and failures, prevent repeated submissions, and isolate requests and completion feedback across Result/project changes.
- Preserve scenario inspection, unsaved issue fields and category, and existing error-based modal access.

## Capabilities

### New Capabilities

- `result-spec-scenario-links`: Manage current Spec coverage from the Result modal, including project-scoped search, link/unlink feedback, cache refresh and context isolation.

### Modified Capabilities

None. This adds management alongside the unarchived `result-scenario-modal` viewing capability; catalog and authoring requirements remain unchanged.

## Impact

Affected areas are `ResultRelatedScenarios`, the modal evidence pane, generated scenario-list/link contracts, non-generated RTK Query enhancements and focused tests. Dependencies are client #105/#107 and backend #73/#104/#116. Reverify the integrated served OpenAPI before implementation acceptance and regenerate affected declarations rather than editing generated files. No backend relation or migration is needed. Acceptance includes authenticated browser checks for persisted changes and another Result of the same Spec, recorded separately from mocked failure/isolation tests.

New scenario authoring, per-Result attachments, AI matching, cross-project links, catalog creator/sort controls and modal entry from Results without errors are out of scope.
