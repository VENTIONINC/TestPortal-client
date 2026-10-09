## Why

Users investigating a failed Result in the existing issue modal can read error evidence but cannot see the managed Test Scenarios explicitly linked to its automated Spec. Backend issue VENTIONINC/TestPortal-backend#116 now exposes those links on the project-scoped Result detail response; client issue #105 tracks presenting them in the modal.

## What Changes

- Add a Test Scenarios tab below Logs in the modal's left evidence rail, including when no scenario is linked.
- Show all current linked scenarios and let the user open one within the same modal without losing issue-assignment form state.
- Use the Result detail contract's `relatedTestScenarios` array and render its generated Markdown as read-only scenario content in this Result context.
- Provide loading, empty, error, retry, and project-isolation behavior.

This change covers viewing explicit links in the existing error-based modal. Adding or removing Spec links and opening the modal from Results without errors are separate follow-ups. The backend has Spec-link endpoints but no per-Result attachment model.

## Capabilities

### New Capabilities

- `result-scenario-modal`: Inspect current, explicitly linked Test Scenarios in the existing Result issue modal.

### Modified Capabilities

- `test-scenario-authoring`: Clarify that its no-Markdown-preview rule applies to scenario authoring routes while the Result issue modal may render the backend-generated Markdown read-only.

## Impact

The Results issue modal and its evidence navigation, authenticated Result-detail API consumption, generated client contract, and focused UI tests are affected. The existing Test Scenario authoring screens and backend relations are unchanged. Backend PR VENTIONINC/TestPortal-backend#117 supplies the detail response.
