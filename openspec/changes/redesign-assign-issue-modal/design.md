## Context

The Results tab currently distributes one job across three interfaces. Clicking an error message opens a read-only `ResultsErrorDialog`; adding or editing an issue opens `ManageIssueDrawer`; and unconfirmed assumptions are confirmed or rejected inline. `useManageIssue` already supports project-scoped issue search, issue creation/update, association creation, and two formatter endpoints, but it has no explicit workflow state and its current delete action deletes the entire issue rather than merely unassigning it.

The generated client currently exposes assumptions CRUD, result-error assignment, issue CRUD/search, and two formatter endpoints. It does not expose a dedicated similarity-search response containing a candidate, score, and impacted-test count. Its result-error model also lacks logs, source snippet, and generated test-case fields. In addition, `POST /api/v2/error-formatter/result` currently returns only `description`, while the requested AI state requires category, name, and description. These contract gaps must be tracked with the backend; the UI can implement stable empty/error states and adapters in advance but cannot synthesize missing evidence or metadata.

## Goals / Non-Goals

**Goals:**

- Consolidate all Results-tab error inspection and issue assignment/edit entry points into one responsive modal.
- Model the nine requested assignment states explicitly and make transitions testable.
- Preserve manual search and issue lifecycle behavior while separating unassignment from issue deletion.
- Integrate algorithmic matching and AI drafting behind typed service boundaries that can adopt backend contracts without reshaping the modal.
- Remove only the inline result-analysis trigger; preserve existing analysis badges and review behavior.
- Deliver accessible light/dark presentation using the existing Chakra theme and dialog stack.

**Non-Goals:**

- Inventing Logs, Snippet, Test Case, similarity, affected-test count, or AI draft fields on the client when the backend does not supply them.
- Changing the meaning or storage of Result analysis categories and confidence.
- Deleting an Issue as part of unassigning it from a result error.
- Adding generated test-case production or source-code retrieval to the client.
- Redesigning issue cards or issue management outside the Results-tab flow.

## Decisions

### Replace both Results entry surfaces with a feature-owned dialog

Create a result-issue dialog feature under the existing dialog system and route error-message, add-control, and confirmed-pill entry points through one `useResultIssueDialog` hook. The hook accepts the selected result plus result error and, for edit mode, the confirmed assumption/issue. Carrying the parent result is necessary for the title row and AI input context that cannot be reconstructed from `ResultError` alone.

The dialog owns a responsive shell with an evidence pane and an assignment pane. On wide screens these are columns; on narrow screens they stack or use a compact pane switch while preserving both workflows and form state. The existing error section/copy behavior should be extracted into a reusable evidence component rather than nesting or retaining the old read-only dialog.

Alternative considered: open the existing error dialog and drawer together. Rejected because independent overlays split focus, duplicate close behavior, and cannot provide a coherent shared state.

### Represent the right pane with a reducer-driven state machine

Use a discriminated union and reducer for the nine visible states. Keep durable form data (category, name, description, selected issue, per-field undo values) separate from transient request state. Events such as `MATCH_STARTED`, `MATCH_FOUND`, `MATCH_EMPTY`, `MATCH_FAILED`, `AI_STARTED`, `AI_SUCCEEDED`, `AI_FAILED`, `EDIT_CONFIRMED`, and `RESET_UNASSIGNED` make valid transitions explicit. Each request is scoped to the active modal/result-error identity so late responses are ignored.

State determines the banner copy, provenance affordance, and footer configuration. Form validation and API mutations remain in focused hooks/services; the reducer does not perform I/O.

Alternative considered: derive the experience from several loading/error booleans. Rejected because overlapping booleans permit contradictory UI, make the nine-state inventory difficult to cover, and increase stale-response risk.

### Separate evidence, workflow, and persistence responsibilities

Split the feature into independently testable units:

- modal shell and opener: context, layout, focus, and mode;
- evidence pane: Error/Logs/Snippet/Test Case rendering and copy behavior;
- assignment reducer: state transitions only;
- assignment form: category, name, description, validation, and per-field polish controls;
- workflow hook: matching and AI orchestration with cancellation/stale-response guards;
- persistence hook: create/select issue, create/confirm/reject/delete association, update issue, and cache refresh.

Use existing generated RTK Query hooks; handwritten API code is limited to a typed adapter only if a backend endpoint lands before generated types are refreshed. Generated code itself remains generated.

Alternative considered: expand `useManageIssue` and `ManageIssueDrawer` in place. Rejected because that hook already mixes form, search, formatting, persistence, and drawer lifecycle; adding nine states and evidence would deepen the coupling and retain the wrong overlay abstraction.

### Treat category as issue-assignment context, not Result analysis mutation

Category chips use the canonical values `bug`, `infra`, `performance`, `script`, and `other`, with the prototype label Environment mapped to the existing API value `infra`. The selected category is passed as `contextCategory` to message-polish calls and used in the assignment contract agreed with the backend. The removed inline action is not moved: the modal never calls `POST /api/v2/result-errors/analyze`, because that endpoint writes Result analysis fields rather than drafting Issue fields.

Until the result-based formatter returns category and name as well as description, the UI must not claim a complete AI draft. The backend contract should be extended (and generated API refreshed) before enabling the `suggested-ai` success state; failure or unavailable behavior remains explicit meanwhile.

Alternative considered: reuse Result `analysisCategory` as the modal's AI-generated issue category. Rejected because the issue explicitly distinguishes the two flows and doing so would silently couple issue drafting to a separate mutation and provenance model.

### Use association deletion for Unassign and issue update for Update

Confirmed edit mode is tied to the confirmed assumption, not merely its Issue. `Unassign` calls the assumption deletion endpoint with project ownership and leaves the Issue intact. `Update` edits the Issue fields; `Cancel` persists nothing. Suggested confirmation/rejection updates the assumption where an algorithmic assumption already exists, while assigning a manually selected or newly created Issue creates a confirmed user association.

Alternative considered: keep the drawer's Delete button behavior. Rejected because deleting an Issue can remove associations across other failures and does not satisfy the requested Unassign semantics.

### Stage backend-dependent evidence and matching behind capability-shaped inputs

Define a view model for evidence and a service result for similarity. Existing Error data populates immediately. Logs, Snippet, and Test Case render truthful empty states until optional backend fields exist. Similarity starts only when a supported lookup is available; its adapter must return candidate Issue, similarity score, affected-test count, and, where applicable, assumption identity for confirm/reject.

The backend ticket must specify:

- logs, source path/snippet/failing line, and generated test case fields;
- a project-scoped similarity lookup for a result error, including candidate issue, score, impacted-test count, and association identity/semantics;
- a result formatter response containing canonical category, name, and description;
- the exact payload used by AI drafting so the provenance popover remains accurate.

Alternative considered: approximate similarity by querying issue names with the error message. Rejected because it cannot honor the documented three signals or produce a meaningful score.

### Test behavior at reducer, component, and integration boundaries

Add reducer tests for every valid async transition and stale-response case. Add component tests for all nine state presentations, footer actions, evidence empty/data states, popover copy, category mapping, per-field undo/retry, entry modes, focus behavior, and light/dark tokens where practical. Add integration-style tests with mocked RTK Query behavior for create/assign, select/assign, suggestion confirm/reject, update, unassign, matching retry, and AI retry. Keep existing Results execution-card and inline-issue tests updated to prove the old inline action and drawer opener are gone while analysis badges remain.

## Risks / Trade-offs

- [Backend contracts are incomplete for three evidence tabs, similarity, and the full AI draft] → Track a linked backend change, keep typed adapters and truthful empty/error states, and do not mark dependent success paths complete until generated contracts exist.
- [A two-pane modal can become unusable on small screens] → Use responsive layout behavior, bounded scrolling per pane, and viewport-focused component tests.
- [Late async responses can overwrite a user's newer selection or draft] → Key requests by modal instance and result-error ID, cancel where supported, and ignore mismatched completions in the workflow reducer.
- [Updating a shared Issue may affect other associated failures] → Make Update copy explicit in confirmed mode and keep Unassign association-only.
- [Category terminology differs between prototype and API] → Centralize display-label-to-canonical-value mapping and test Environment → `infra`.
- [Removing the inline AI trigger too early creates a temporary capability gap] → Land removal only after modal AI categorisation is backed by the complete backend contract and enabled end to end.
- [The prototype's exact popover copy can drift during implementation] → Store the approved copy in focused components/constants and assert the required signals, inputs, warning, and priority order in tests.

## Migration Plan

1. Agree and implement the linked backend contracts for evidence, similarity, and complete result-based AI drafts; regenerate the client API types.
2. Introduce the modal shell, evidence view model, assignment reducer, and entry hook while the existing drawer remains available internally.
3. Implement manual assignment/edit/unassign behavior and switch all three Results entry points to the modal.
4. Enable automatic matching, AI categorisation, provenance, and per-field polish when their contracts are available.
5. Remove `ManageIssueDrawer`, the old Results error dialog, and their exports after all entry points have migrated.
6. Remove `AnalyzeCategoryButton`, its render branch, result-analysis mutation, handler, and loading state only after modal AI categorisation is operational.
7. Run focused tests, the full client test suite, lint, TypeScript checks, and manual light/dark responsive validation against the local backend.

Rollback is client-only until backend fields are consumed: restore the old entry hooks and components and disable the new modal. Backend additions should remain backward-compatible optional response fields or endpoints so a client rollback does not require data migration.

## Open Questions

- What is the final backend endpoint and response contract for automatic similarity, including how a rejected match is recorded?
- Will `POST /api/v2/error-formatter/result` be expanded to return canonical category and name, or will a new endpoint own the complete AI draft?
- Which backend models/endpoints will supply Logs, Snippet, and Test Case data, and can each field be absent independently?
- Does Update intentionally modify the shared Issue for every association, or should confirmed mode edit only association-level metadata where possible?
- Should closing an AI-drafted but unassigned form prompt for confirmation when it contains unsaved changes?
