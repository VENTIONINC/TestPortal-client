## Context

See proposal.md for motivation and scope. The client on `feature/TMS` has generated scenario/run contracts without readable keys. Scenario authoring uses an explicit editable-field list, normalization/PATCH helpers, form reconciliation, and an explicit detail equality comparator. Optional fields currently render as textareas. Scenario detail Start and completed-run Retest are separate guarded start paths sending empty bodies.

Run detail maintains authoritative saved state and execution drafts, serializes writes, and treats all completed/foreign/null-executor runs as read-only. History supports project and nested scenario endpoints, local ephemeral filters, page reset, UUID provenance, calendar date bounds, and currentData. Project/scenario-scoped run tags already refresh histories on run PATCH.

Backend PR #120 merged into `feature/TMS` at `6824f6f8fa38b5509a5cea17532bd18b719ee631`. Its design and service/controller expose nullable keys, label-only completed-run PATCH, and exact captured-key filtering. The inspected update controller/service do not establish an executor-specific authorization policy. Keep the client's existing executor restriction for label editing rather than broadening access based on the absence of checks in these layers; verify actual mounted authorization during acceptance. Foreign/null-executor runs remain view-only in this change.

Frontend #105's related-scenario view is absent from this checkout. It must be integrated before implementing its key display and cache checks. The canonical catalog presentation is older than active summary adoption; its delta retains current Details and Created by columns.

## Goals / Non-Goals

**Goals:** Complete additive field propagation, explicit metadata saves, historical accuracy, shared start behavior, and preserved draft/scope boundaries.

**Non-Goals:** New state libraries, generated-file hand edits, broadened run-edit permissions, backend changes, key lookup/identity, or changes to execution completion eligibility. See proposal.md for product exclusions.

## Decisions

### Generated contract as the boundary

Use the existing generator against a verified served OpenAPI from the merged backend contract; `rtk-query-codegen.config.cjs` defaults to a remote environment, so explicitly select the compatible schema through `RTK_QUERY_OPENAPI_URL`. Compare generated changes and isolate unrelated contract drift. Include TestScenario, TestScenarioSummary, create/update requests, run start/update/detail, both history summary schemas, the project-history query, and #105's Result-specific summary. Regenerate separate Result-detail declarations if #105 uses them. No MCP-specific client consumer currently needs this feature; do not regenerate an unrelated MCP API.

Hand-written types or assertions were rejected because they could hide missing served schema support. UUID routes, cache identity, row keys, Spec links and source provenance stay unchanged.

### Scenario input and presentation

Add Scenario key before Title in the catalog as a dedicated column, including loading headers/cells. Preserve Title, Details, Created by, Created, Updated and actions. Render long keys with wrapping. Scenario detail shows `Scenario key: <value>` below the heading, with `N/A` for null.

Create/edit uses a dedicated single-line input immediately before Title: label `Scenario key (optional)`, placeholder `e.g. R1 or AUTH-LOGIN`, helper `Up to 100 characters. Duplicate keys are allowed.` The placeholder is not a default. Add the field to editable types, initial/default values, schema, payload helpers, memo dependencies, dirty reconciliation and the explicit detail equality comparator. Exclude it from the generic textarea loop. Normalize trimmed blanks to omission at creation or null when clearing a stored key; omit unchanged PATCH fields. Validate normalized nonblank keys to 100 characters and reject line breaks; preserve internal spaces/case and permit duplicates. Key-only edits never submit or regenerate contentMd/hash/version.

An inline catalog edit was rejected to preserve the existing dedicated authoring flow.

### Shared Start and Retest dialog

Use one shared dialog with scenario context, a blank `Run key (optional)` input, placeholder `e.g. RUN-1`, helper `Up to 100 characters. Duplicate keys are allowed.`, Cancel and Start run. Retest additionally explains `This starts a new run using the current saved scenario.` Identify historical context accurately: do not present the old captured source key as the current scenario key or add a live scenario fetch merely for dialog decoration. Display a current key only when current data is available; otherwise use the saved title as historical context with the explanation.

Start and Retest each supply their existing UUID/project arguments. Creation omits a blank runKey; neither copies nor generates a key. Both retain synchronous duplicate guards, zero automatic retries, post-await scope checks and source-deleted retest behavior. Validation/server errors retain input. An ambiguous result remains in the dialog with history-inspection guidance; another explicit submission warns of duplicate-run risk. Scope changes close/reset the dialog, and cancellation restores trigger focus without a request.

Separate dialogs were rejected because the input and validation behavior are identical. Immediate start is deliberately superseded by this optional-label dialog.

### Run metadata is editable independently of execution

Show Run key below the detail heading with explicit Save and Discard actions for the authenticated executor, including completed runs. Missing run keys display as `N/A`. Show `Source scenario key at start` in snapshot metadata with `N/A` fallback. Both histories show separate Run key and Scenario key columns, with Run key immediately before Title; missing keys display as `N/A`. Keep Source deleted and source-history actions in the Source column, whose navigation continues to use UUIDs.

Separate `canEditRunKey` from execution read-only status; retain executor identity checks. Always send a minimal `{ runKey: valueOrNull }` PATCH, even on active runs. Never include notes/status or sourceScenarioKey, and never add runKey to POST complete. Reuse the execution write coordinator rather than introduce competing requests: label saves, step saves, notes saves and completion cannot overlap. Completion requires saving/discarding an unsaved label draft as well as execution drafts; retest requires saving/discarding a completed run's label draft before leaving. Dirty labels are not silently discarded or attached to completion/start bodies.

Reconcile returned authoritative run state while preserving unrelated label/notes/step drafts. Label failure keeps draft input; unchanged saves cause no mutation. 409 uses authoritative recovery and preserves rejected drafts; failed recovery blocks writes. Revise recovery/completion copy to distinguish frozen execution results from editable labels. Do not change progress counts, saved outcomes or completion eligibility.

Coupling labels to execution-note Save was rejected because it fails on completed runs and risks sending forbidden mixed requests.

### Exact source-key filtering with explicit Apply

Extend history filter types/defaults and hook/container/view adapters with an applied sourceScenarioKey plus a separate input draft. Project history labels the field `Scenario key`, uses placeholder `e.g. R1 or AUTH-LOGIN`, and shows `Exact match, case-sensitive.` in a hover tooltip on an info icon beside the label. Apply validates and trims the input, resets page to 1 and sends one applied value. Empty Apply removes this predicate; invalid input shows an error without changing the applied query. Typing alone does not request. Other filter changes continue to use the applied key and preserve existing behavior.

Combine it with UUID provenance, status and dates using the backend query. Clear filters resets both draft/applied keys and page. Project or route-scope changes reset everything; currentData prevents stale displays. Do not extend the nested endpoint or persist filters. Source-history navigation continues using UUIDs to cover all historical labels after renames. Show a concise explanation that matching keys can belong to multiple scenarios and are captured at run start. No null-label selector is introduced.

Live-on-keystroke filtering was rejected to avoid partial exact-match queries; a catalog picker cannot find deleted sources or historical labels.

### Result view and cache refresh

Integrate #105's existing display scope before adding current scenarioKey beside titles in its selection and content. Use `N/A` for null. Preserve backend ordering, read-only content, selected-project/Result isolation, unsaved issue fields and Spec-link behavior. Do not add attachment controls.

Run-key PATCH reuses scoped detail/project-history/scenario-history invalidation. Confirm all filtered histories receive refreshed persisted labels. Scenario PATCH must also invalidate related Result detail caches; enhance endpoints outside generated files, and ensure mutations use the enhanced registration. A scenario-key change updates current scenario consumers but does not rewrite/refill captured keys on existing runs. Label filtering remains based solely on response snapshots.

### Spec synchronization order

This new capability owns additive readable-key behavior. Its completed-label exception supersedes the blanket immutable/read-only wording in active execution/history changes; its dialog replaces the immediate-start flow. During final synchronization, preserve predecessor requirements while making those exceptions explicit, then apply this capability and the catalog delta. Do not archive predecessors or mark their QA complete as part of proposal creation. Preserve active summary adoption's catalog metadata additions when reconciling overlapping presentation deltas.

## Risks / Trade-offs

- [#105 missing locally] → Integrate the agreed Result-view dependency first; do not claim #107 complete without that surface.
- [Merged backend differs from running/deployed API] → Verify served schema and migration readiness; a merged PR alone is not deployment evidence.
- [Metadata save overwrites execution drafts] → Share write serialization and test reconciliation under refetch, failures and scope changes.
- [Duplicates/renames confuse history] → Label the filter as captured exact matching and preserve UUID-based full source history.
- [Long labels widen tables] → Wrap the separate catalog key column and verify narrow layouts.
- [Authorization evolves independently] → Preserve executor-only client editing and honor server rejections without losing input; verify actual backend routes before acceptance.
- [Active predecessor deltas overwrite new requirements] → Reconcile final synchronization order and explicit exceptions before archival.

## Migration Plan

1. Verify compatible backend schema and database migration, integrate #105, and regenerate affected authenticated contracts.
2. Implement scenario flows, shared start UI, run metadata editing and historical filter/presentation with scoped cache refresh.
3. Run focused coverage and `yarn lint`, `yarn test`, `yarn build`; verify authenticated browser flows with a compatible backend, distinguishing simulated tests from live integration.
4. Release alongside the additive backend contract. Client rollback removes label controls while retaining stored labels and historical snapshots; no data migration is performed by the client.
