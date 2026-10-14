# Proposal

## Why

The Test Scenario catalog currently has no folder or suite navigation, while the backend now exposes project-scoped APIs for hierarchical folders, mutable manual suites, and server-side organization filters. Integrating those contracts gives testers a stable home for each scenario and reusable Smoke, Regression, and release selections without duplicating scenario records or disrupting execution history.

## What Changes

- Add catalog navigation for all scenarios, unfiled scenarios, a project folder tree, and manually maintained suites.
- Add folder-aware scenario creation and editing, folder breadcrumbs and descendant controls, scenario search, pagination, and bulk folder/suite membership actions.
- Add folder and suite management flows, including safe folder deletion dispositions and ordered suite membership.
- Consume the backend's project-scoped REST contracts and regenerate the client API from the backend OpenAPI document; keep filtering, counts, and pagination server-side.
- Reset selected folder/suite, search, pagination, and displayed data when project context changes.
- Keep suite membership mutable and current; do not present a release suite as historical evidence or change run history.

## Capabilities

### New Capabilities

- `test-scenario-organization`: Catalog organization and interaction with project folders and manually curated suites.

### Modified Capabilities

- `test-scenario-catalog`: Extend catalog behavior with folder/suite navigation, organization filters, and project-scoped search and bulk operations.
- `test-scenario-authoring`: Allow optional folder assignment during scenario creation and editing, including creating from the currently selected folder.

## Impact

Affected client areas include generated RTK Query API bindings, scenario catalog containers/views/hooks, scenario create/edit forms, organization management dialogs, cache invalidation, translations, and mirrored tests/specifications. The backend contract source is `../TestPortal-backend/src/lib/openapi/testScenarios.ts` and its implementation is on the matching `feature/test-suites-and-folders` branch; it defines folder, suite, suite-member, bulk-folder, and scenario list operations. No backend API implementation is part of this client change, and generated API files must come from OpenAPI generation rather than manual editing.
