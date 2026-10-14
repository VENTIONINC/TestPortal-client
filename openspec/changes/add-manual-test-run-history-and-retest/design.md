## Context

See proposal.md for motivation and ticket scope. The current #92 branch provides generated project/nested history queries, authenticated detail execution, guarded start and scoped history cache tags in extendedApi.ts. Navigation currently exposes Test Scenarios, and only `/manual-test-runs/:runId` exists. Scenario deletion invalidates scenario tags but not run/history tags. Run detail already renders snapshots independently of live source retrieval and handles nullable executors, but does not display source deletion explicitly.

Backend history summaries include snapshot title, immutable sourceTestScenarioId and nullable testScenarioId. Source deletion detaches runs using SET NULL while retaining copied run steps. Project history filters by immutable provenance; nested history requires a live source and returns not-found after deletion. Local source and existing tests establish this intended behavior; the served OpenAPI and migrated database must be verified during implementation.

## Goals / Non-Goals

**Goals:** Reuse container/view boundaries, queries and detail execution while ensuring local filter state, correct date conversion and deletion-safe access.

**Non-Goals:** No new state library, backend changes, durable navigation filters, automatic drift detection, per-row full-body queries or idempotent-start guarantees.

## Decisions

### Separate history routes with shared presentation

Add `/manual-test-runs` and `/test-scenarios/:scenarioId/manual-runs` within existing authentication/project guards. Add Manual Test Runs beside Test Scenarios in left navigation and a scenario-detail history link. Use shared table/filter/pagination views with project and nested query adapters. Reuse #92 detail for row navigation; label active action Resume only for its executor and all other actions View. Inline scenario history was considered, but a separate route keeps filtering and pagination off scenario detail.

### Ephemeral filters and scope boundaries

Keep page, status, source ID and calendar date strings in page-local state; no URL query, Redux persistence or browser storage. Key history boundaries by selected project and route scenario, reset page atomically when filters change, and render query currentData for the full argument scope. Route identity retains nested scenario scope after reload; other filters reset.

Historical row/detail actions may pass a one-use source ID and snapshot label through router navigation state to initialize project history, including deleted sources. Consume and clear that navigation state after initialization so reload/ordinary re-entry does not restore filters. Never persist other filters/page or replay abandoned-project state. URL parameters were considered but conflict with the no-persistence decision.

Project source filtering supports an explicit source UUID as well as contextual initialization from historical rows/detail. A current catalog picker can be used only if its supported server contract permits complete discovery; do not rely on one paginated catalog page as a complete selector. Preserve a deleted source ID even when no live catalog option exists. Snapshot labels identify historical context rather than asserting a current title.

### Local calendar dates and server pagination

Parse validated calendar components into local midnight dates, construct the end boundary using the next local calendar date and serialize with toISOString. Reject invalid/reversed ranges. Do not add fixed milliseconds for the end date. Use limit 30 and response totals/page counts, preserve startedAt/ID descending server order, and treat offset-page drift as expected. Never perform paginated client-side filtering. Validate DST transitions with an explicit test timezone.

### Provenance and source links

Use testScenarioId nullability to show Source deleted in rows/detail. For a live relation, provide View current scenario on detail and concise wording that current content may differ from the saved snapshot. Preserve snapshot presentation and do not fetch the live source as historical content. Provide View source history from historical rows/detail using sourceTestScenarioId. Nested history 404 offers the same project-history fallback, retaining the original route ID. A source link racing with deletion receives the existing unavailable-scenario state.

### Retest only from completed detail

Active rows owned by the current user open existing detail through Resume, including detached runs. Other active rows provide View. Retest appears only on completed detail, disabled with a source-deleted explanation when the live relation is null. Explain current saved content and fresh outcomes/notes next to the action. Use the enhanced start mutation with `{ scenarioId: run.testScenarioId, projectId, manualTestRunStartRequest: {} }`, synchronous duplicate guard, visible pending state and post-await project/run scope guard. Navigate only on confirmed scoped success. Reuse #92 uncertainty handling and zero transport retries; failed/ambiguous requests retain history and offer history inspection without automatic replay. Source-not-found errors refetch authoritative detail. Row retest was considered but rejected by the agreed detail-only interaction.

Completed detail has no editable execution drafts, resolving retest draft loss without a save/discard flow. Opening active runs starts no mutation and does not reopen completed records.

### Deletion feedback and cache refresh

Extend exact-title deletion copy to explain preserved runs/snapshots and unavailable future starts. Enhance deletion outside generated declarations and ensure the dialog uses the enhanced mutation. On success invalidate project history, source history and affected run detail via a project-scoped source tag provided by each detail query. A project-wide detail invalidation tag is an acceptable conservative fallback if source-specific invalidation cannot cover existing detail caches. Keep snapshot text intact; refresh only authoritative relation/status presentation. Preserve existing start/completion history invalidation. Changing database deletion behavior is unnecessary.

## Risks / Trade-offs

- Starts have no idempotency contract → prevent local duplicates, warn on ambiguous results and allow history inspection; do not promise identification of the exact uncertain attempt.
- Source edits may change title and steps → label the current-source link clearly and never assert detected drift.
- Offset pagination shifts with new runs → preserve backend order and avoid frozen-history claims.
- Deleted sources disappear from catalog → retain immutable IDs and contextual snapshot labels independently of live options.
- Late responses can expose stale scope → keyed boundaries, currentData and post-await scope guards for navigation/messages.
- Local backend was unreachable in discovery → verify served OpenAPI/migration readiness before integration work; do not equate source inspection with live QA.

## Migration Plan

Verify a running compatible migrated local backend, compare served history/start/detail contracts and regenerate only through the existing generator if contract drift requires it. Implement feature UI and non-generated cache enhancements together. Run focused coverage then lint, tests, build and authenticated browser QA. Record live versus simulated deletion/concurrency/transport checks separately and preserve outstanding #92 QA status. Deploy with the compatible backend; rollback removes client entry points without deleting retained runs or reversing migrations.

### Executor-only execution

Compare the authenticated user ID with `executedById`. Unknown identity or a null/different executor makes detail view-only, including direct route access. Hide execution editing and completion, guard mutation callbacks, and explain the restriction. Keep Retest limited to completed detail; viewing a foreign active run must not enable Retest. Reassignment is excluded. Client presentation is not authorization: backend issue #102 must enforce mutation access and return 403 for other users.

### Local execution save actions

Align Save and Discard beneath the notes they affect, with Save first. Step actions stay within the 560px notes width and wrap on small screens. Show Saved, Unsaved changes or Saving locally. Disable unchanged Save/Discard and preserve existing pending/recovery guards. Ctrl/Cmd + Enter in a notes field saves only that field's run notes or step, with the same guards. No autosave is introduced.
