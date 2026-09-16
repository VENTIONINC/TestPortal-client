## Why

Users can discover project-scoped Test Scenarios, but they cannot author or maintain the raw Markdown scenarios from the client. The locally running backend now exposes the required create, detail, partial-update, and delete contracts, so the client can add the complete manual authoring workflow on top of the catalog introduced by `add-project-scoped-test-scenario-list`.

## What Changes

- Add protected, project-guarded routes for creating, viewing, and editing a scenario.
- Add a create action, scenario-title links to detail pages, and a final, untitled actions column to the Test Scenario catalog.
- Add the application's standard three-dots context menu to every scenario row with **Edit Scenario** and **Delete Scenario** actions.
- Add a dedicated read-only scenario details page that displays the persisted title and rendered Markdown, exposes edit and delete through the standard three-dots context menu, and can grow with future scenario functionality.
- Add a separate scenario edit page with a shared form that supports raw Markdown source editing and a readable GFM preview without altering the source.
- Create scenarios for the selected project and navigate successful creations to their detail route.
- Retrieve scenario detail with both `scenarioId` and the selected `projectId`, without displaying stale data from another project.
- Save edits through project-scoped PATCH requests containing only changed fields.
- Add explicit validation, loading, success, API-error, unavailable-scenario, and project-switch states.
- Open the read-only details page from a scenario title and the separate edit page from the row context menu.
- Add title-aware delete confirmation that requires entering the exact scenario title, redirect to the catalog after successful deletion from either entry point, and refresh affected scenario caches.
- Keep Spec links, execution evidence, revision history, autosave, and concurrent-edit resolution outside this change.

## Capabilities

### New Capabilities

- `test-scenario-authoring`: Project-scoped creation, detail viewing, exact Markdown editing and preview, partial updates, and deletion of Test Scenarios.

### Modified Capabilities

None.

## Impact

- Routing and navigation: separate Test Scenario create, read-only details, and edit paths with guarded route composition.
- Test Scenario catalog: create affordance, title-to-detail links, blank-header actions column, row context-menu trigger, and edit/delete options.
- UI and state: extensible read-only detail view with a shared edit/delete context menu, scenario edit form, shared project-scoped request boundaries, Markdown preview, protected delete dialog, post-delete navigation, mutation feedback, and project-switch isolation.
- Validation: title normalization-compatible checks and exact, non-empty `contentMd` handling.
- API integration: generated Test Scenario create, detail, PATCH, and delete hooks from the local OpenAPI contract.
- Tests: route protection, read-only details context-menu behavior and separate edit navigation, action-column behavior, exact-title delete confirmation, post-delete list redirection, create/detail/update/delete flows, partial PATCH payloads, exact Markdown round trips, validation, error states, cache behavior, and project switching.
