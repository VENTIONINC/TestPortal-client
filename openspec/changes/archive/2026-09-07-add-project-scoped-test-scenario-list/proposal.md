## Why

Test Portal users currently have no client entry point for discovering the Markdown Test Scenarios that belong to their selected project. The backend already exposes an authenticated, project-scoped paginated list, so the client can establish the Test Management foundation needed before scenario detail and authoring workflows are added.

## What Changes

- Regenerate the authenticated RTK Query API from the currently available backend OpenAPI contract so Test Scenario types and hooks are available to the client.
- Add a protected, project-guarded `/test-scenarios` route and a standard **Test Scenarios** sidebar link.
- Add a paginated table that requests up to 10 scenarios for the selected project, displays **Title**, **Created**, and **Updated** columns, and places pagination controls below the table.
- Add loading, error, empty, populated, and pagination states consistent with existing client patterns.
- Reset pagination and prevent previously selected-project data from remaining visible when the selected project changes.
- Treat list entries as summaries: do not render or otherwise depend on `contentMd`, even though the current backend list schema includes it.
- Keep scenario detail, creation, editing, deletion, Markdown rendering, Spec links, Results, observed Issues, and MCP browser integration outside this change.

## Capabilities

### New Capabilities

- `test-scenario-catalog`: Authenticated navigation and project-scoped discovery of paginated Test Scenario summaries.

### Modified Capabilities

None.

## Impact

- Generated API: `src/redux/apis/generatedApi.ts` will be regenerated from `http://127.0.0.1:3001/api/openapi.json` during implementation.
- Routing and navigation: `src/types/paths.ts`, `src/router/index.tsx`, and the main navigation configuration.
- UI: a new Test Scenarios page and catalog table components using the selected-project state, shared page template, status primitives, and pagination component.
- Tests: generated-contract, route/guard, navigation, catalog states, pagination, and project-switch isolation coverage under `src/__tests__/`.
