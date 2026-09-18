## 1. Contract readiness

- [ ] 1.1 Verify local backend health, migrated database readiness and served OpenAPI for project/nested history, detail and start; record actual response fields/filter semantics and regenerate using the existing generator if drift requires it, reviewing the generated diff without manual declarations.
- [x] 1.2 Confirm enhanced query consumers and project/source cache tags are available; verify query argument identity covers project, route scope, filters and pagination and retain existing mutation retry policy.

## 2. History entry points and state

- [x] 2.1 Add protected project/nested history pages, paths, exports and Manual Test Runs left-navigation entry plus scenario-detail history link; verify routing tests cover authentication/project guards and exact destinations.
- [x] 2.2 Implement project/nested query adapters and local filter/page state in keyed boundaries; verify combined payloads, nested omission of testScenarioId, page-1 reset on filter/project changes and no display of late prior-scope data.
- [x] 2.3 Add date validation and local calendar-boundary conversion; verify start/end independently, inclusive start, exclusive next-day end, invalid/reversed ranges and DST transitions in an explicit timezone.
- [x] 2.4 Implement shared summary table, status/source/date controls and backend pagination at limit 30; verify server totals/order, nullable executor/completed timestamp display, loading/error/retry/empty/no-match states and absence of per-row detail requests.
- [x] 2.5 Implement explicit source-ID filtering and one-use historical navigation initialization independent of the live catalog; verify deleted IDs remain usable, navigation state is consumed, and reload/ordinary re-entry restores defaults without persistent filters/page.

## 3. Snapshot provenance and resume

- [x] 3.1 Add Source deleted to history/detail, View current scenario with possible-difference wording on live-source detail and View source history actions; verify null/live relations, snapshot preservation and no claimed drift detection.
- [x] 3.2 Add nested-history source-not-found fallback to project history retaining the original source filter; verify 404 is distinct from empty history and late scope responses cannot trigger fallback under another project.
- [x] 3.3 Wire active Resume and completed View to existing detail; verify Resume performs no start, detached active runs remain executable for their executor, completed snapshots remain read-only and active runs offer no Retest.

## 4. Completed-run retest

- [x] 4.1 Add Retest only on completed detail with current-content/fresh-state explanation and disabled deleted-source state; verify all terminal statuses, absent row retest and unchanged original snapshot/outcomes.
- [x] 4.2 Wire the enhanced start mutation with empty valid body, live source ID, selected project and synchronous pending/scope guards; verify exact payload, duplicate prevention, successful-response-only navigation and rejection of late abandoned-project/run navigation/messages.
- [x] 4.3 Add retest errors and ambiguous-result feedback with history inspection and authoritative refresh on source deletion; verify no automatic replay, preserved historical view and unavailable retest after detached detail refresh.

## 5. Scenario deletion and history caches

- [x] 5.1 Extend exact-title deletion confirmation to explain preserved runs/snapshots and unavailable future starts; verify existing exact-match, cancellation, pending and failed-delete behavior remains intact.
- [x] 5.2 Enhance deletion outside generated code and use the enhanced consumer to invalidate project/source history and affected detail; verify deletion updates Source deleted/current-source links/Retest availability while start/completion still refresh correct history scopes without cross-project leakage.

## 6. Integrated verification

- [x] 6.1 Run yarn lint, yarn test and yarn build; verify passing exits, mirrored tests under src/__tests__ and retained #92 execution plus scenario catalog/authoring behavior.
- [ ] 6.2 Perform authenticated browser QA against the migrated local backend: project/scenario history, combined filters/totals, pagination, reload defaults, source edit/deletion with multiple active/completed runs, current-source link, nested fallback, detached resume and fresh completed retest; record live observations separately from simulated errors/concurrency and do not mark unrelated #92 QA complete by inference.
- [x] 6.3 Validate the change with strict OpenSpec validation and git diff --check, review final served-contract compatibility and ticket boundaries; verify no backend modifications or excluded features and record any delivery dependency separately from local QA.

## 7. Executor-only client access

- [x] 7.1 Restrict Resume and detail execution changes to the current executor, default missing identity to view-only, preserve completed Retest, and verify own/foreign/null-executor behavior with focused tests and lint/build checks. Backend authorization remains tracked in backend #102.

Verification for 7.1: yarn lint and yarn build passed; yarn test passed (62 files, 269 tests); strict OpenSpec validation and git diff --check passed. Authenticated two-user browser QA and backend #102 enforcement are not yet verified.

## 8. Local save actions

- [x] 8.1 Move execution Save/Discard beneath their notes, add local state and dirty guards, support Ctrl/Cmd + Enter, and verify existing explicit-save and read-only behavior.

Verification for 8.1: detail tests passed (16 tests), including disabled unchanged saves and Ctrl + Enter step saving; yarn lint, yarn build, strict OpenSpec validation and git diff --check passed. Browser layout QA remains pending.
