## Why

Client issue #85 requires the catalog to consume lightweight Test Scenario summaries and show details and creator metadata. The API running on port 3001 already supplies this contract, but the catalog currently discards the new fields and users also need to author optional details when creating and editing scenarios.

## What Changes

- Adopt generator-produced `TestScenarioSummary` and `TestScenarioCreatorSummary` contracts from the local backend OpenAPI document.
- **BREAKING**: Treat list records as summaries without `contentMd`; full Markdown remains available through project-scoped detail retrieval.
- Display Title, Details, Created by, Created, Updated, and the existing final actions column. Render null details as `No details` and creator name with secondary email.
- Add an optional plain-text Details field to create and edit forms. Omit blank details on creation; send `null` when clearing existing details during editing.
- Preserve project isolation, 10-row pagination, request states, title navigation, and existing actions.
- Update contract, catalog, and detail/edit regression coverage using distinct summary and full-scenario fixtures.
- Use the running local contract during fullstack development; backend PR closure or merge is not a prerequisite for this work.

## Capabilities

### New Capabilities

- `test-scenario-summary-consumption`: Lightweight list contract adoption, plain-text details and safe creator presentation, optional details authoring in create/edit forms, and separation of summary retrieval from Markdown retrieval.

### Modified Capabilities

None. The catalog and authoring capabilities currently exist in active changes rather than canonical `openspec/specs/`. This additive capability composes with those changes without recreating their routing or authoring requirements.

## Impact

- Issue: https://github.com/VENTIONINC/TestPortal-client/issues/85; backend contract: https://github.com/VENTIONINC/TestPortal-backend/pull/91.
- `src/redux/apis/generatedApi.ts`, Test Scenario types, summary utilities, catalog hook/view, shared authoring form/schema, create/edit containers, PATCH utility, and affected tests under `src/__tests__/`.
- Existing changes: `add-project-scoped-test-scenario-list` and `add-markdown-test-scenario-crud`. Coordinate their final contract validation with this change without marking their tasks complete automatically.
- API source: `http://127.0.0.1:3001/api/openapi.json`. Regeneration already produced a narrow pending diff during exploration; retain generator ownership and review further drift if the backend changes.
- No new dependencies, backend changes, Markdown/HTML rendering of details, or creator-deletion lifecycle behavior (backend #90).
