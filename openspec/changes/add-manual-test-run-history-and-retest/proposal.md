## Why

Client issue #93 adds discoverable execution history to #92's Manual Test Run execution UI. Testers need to inspect saved snapshots, resume active runs and retest current scenarios while retaining history after source deletion.

## What Changes

- Add a separate protected Manual Test Runs history page in the left navigation and a separate scenario-history page linked from scenario detail.
- Use backend pagination and combined status/source-scenario/started-date filters; keep filters and pagination in page-local state without persistence.
- Open saved run snapshots from history; offer Resume only for active runs started by the current user and view-only access for other runs and Retest only on completed run detail.
- Link to the current saved source scenario when available and explain that it may differ from the snapshot; show `Source deleted` when the live relation is null.
- Keep deleted-source history accessible and filterable through project history using immutable source provenance.
- Explain history preservation in scenario deletion confirmation and refresh affected run/history caches after deletion.

## Capabilities

### New Capabilities

- `manual-test-run-history`: Project and scenario history, scoped filters/pagination, source provenance, resume and fresh retesting.

### Modified Capabilities

- `test-scenario-authoring`: Scenario deletion confirmation explains retained runs and unavailable future starts; deletion refreshes related run/history presentation.

## Impact

- Routes, paths, navigation, scenario detail, Manual Test Run feature components/hooks, deletion dialog and non-generated API enhancements.
- Client executor restrictions use `executedById`; absent executor/current-user identity defaults to view-only. Backend enforcement is tracked separately in VENTIONINC/TestPortal-backend#102. No reassignment is included.
- Reuses generated project/scenario history, detail and start contracts from #92. No new endpoint, dependency, backend change or client data migration is required.
- Depends on the existing #92 execution implementation and a migrated local backend serving the history contract. Backend PR #97 is open/unmerged with clean mergeability; client PR #95 is an open draft. Port 3001 was unreachable during discovery, so served-contract verification remains an implementation prerequisite.
- Preserve other active OpenSpec changes and untracked QA documents. Tests remain mirrored under `src/__tests__/`.
- Excludes drift detection, comparisons, historical-version replay, retest lineage, suites/plans, unified automated history, analytics and exports.

- Keep execution Save/Discard actions beside their notes, show local saving state, disable unchanged saves, and support Ctrl/Cmd + Enter in notes.
