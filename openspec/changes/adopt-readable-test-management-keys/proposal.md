## Why

TestPortal-client issue [#107](https://github.com/VENTIONINC/TestPortal-client/issues/107) requires readable labels so users can recognize scenarios and manual runs and filter historical runs without copying UUIDs. Backend [PR #120](https://github.com/VENTIONINC/TestPortal-backend/pull/120) has merged the additive contract into backend `feature/TMS`; the client has not adopted it.

## What Changes

- Adopt nullable, editable `scenarioKey` and `runKey`, and immutable captured `sourceScenarioKey`, through generated authenticated API contracts. UUIDs remain identifiers.
- Add a separate Scenario key column before Title; add a single-line Scenario key (optional) input before Title with placeholder `e.g. R1 or AUTH-LOGIN`.
- Display scenario/run keys and explicit missing-label fallbacks in scenario details, both run histories, run details, and the Result modal's related-scenario view.
- Share an optional-run-key start dialog between Start manual run and Retest; every fresh run starts with an empty key input.
- Allow explicit run-key Save/Discard, including authorized label-only edits after completion, preserving frozen execution results and unrelated drafts.
- Add an explicit Apply action for exact, case-sensitive captured source-key filtering on project history, combined with existing filters and reset on scope changes.
- Preserve current Spec-link behavior and integrate the Result display requirement through frontend #105 rather than introducing attachment management.

## Capabilities

### New Capabilities

- `readable-test-management-keys`: Label validation, authoring, detail/history presentation, start/retest interaction, completed-run metadata exception, exact historical filtering, and scope/cache consistency.

### Modified Capabilities

- `test-scenario-catalog`: Add the separate Scenario key column and nullable-label fallback while retaining summary-only presentation.

## Impact

Affected areas include API code generation and cache enhancements, scenario schemas/forms/payload and state helpers, scenario catalog/detail, both run-start paths, run detail save state, history filter adapters/views, related Result scenario consumers from #105, mirrored tests, and OpenSpec synchronization. No new runtime dependency or backend mutation is planned.

The existing active manual-run changes have no canonical specs yet. This capability explicitly supersedes their immediate-start interaction and blanket completed-run immutability only for the optional start dialog and run-key metadata edits. Predecessor requirements must be reconciled during final spec synchronization; their outstanding QA is not completed by this proposal. #105 is absent from this checkout and is a required integration dependency. Compatible served OpenAPI, migrated backend availability, and label-edit authorization must be verified before implementation acceptance.

Automatic keys, uniqueness, key-based routing, scenario-key catalog search, historical backfill, execution reopening, Spec-link management, durable filters, and label audit history are out of scope.
