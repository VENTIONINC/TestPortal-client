## Context

See proposal.md for motivation and ticket boundaries. The client has structured scenario detail, keyed project/scenario boundaries, explicit save and draft reconciliation patterns. It has no Manual Test Run contracts or route. The API generator accepts `RTK_QUERY_OPENAPI_URL`; its default points at a remote environment. Local client API configuration points at port 3001.

The coordinated backend returns full run detail for writes, copies scenario fields and steps on start, and locks run writes. Completed writes conflict. HTTP 409 also represents invalid passed completion, so it does not alone establish that a run is completed. There is no version precondition or idempotency key for start.

## Goals / Non-Goals

**Goals:** Separate saved run state from drafts, use existing route/container/view conventions, make completion explicit and ensure project isolation and accurate failure feedback.

**Non-Goals:** No new state library, backend changes, optimistic mutation success, automatic outcome derivation or concurrent draft merging. Product exclusions are in proposal.md.

## Decisions

### Route and start interaction

Add a visible Start manual run button on saved scenario detail, backed by a synchronously guarded mutation. Start immediately with an empty valid request body; optional notes are entered afterward on the run page. Navigate only from a successful, still-current project/scenario response. A preliminary notes dialog adds unnecessary friction.

Add `/manual-test-runs/:runId` inside existing authentication/project guards. Use a boundary keyed by projectId/runId and validate response identity. Follow existing page, container, hook and view organization under a manual-test-runs feature. Resume uses detail retrieval without a new start. No sidebar history page is added. Before #93, retaining/reopening the run URL is the resume entry point.

### API generation, retries and caches

Regenerate from `http://localhost:3001/api/openapi.json` through the generator environment override, review the whole diff and preserve unrelated contracts. Use non-generated endpoint enhancements for detail/history cache tags and retry policy, loaded by consumers before requests. Detail identity and tags include projectId/runId; history invalidation includes project and source scenario context for #93's generated list operations without implementing its UI.

Disable transport retries for Manual Test Run mutations with the existing `extraOptions: { maxRetries: 0 }` pattern; queries retain their existing retry policy. Preserve token refresh after a definitive 401, verifying that refresh/retry behavior does not bypass the transport retry policy. Start/complete have no automatic replay following ambiguous errors or conflicts. Manual saves avoid delayed retries that could overwrite newer execution state.

### Saved state and drafts

Use full persisted detail as the baseline, with separate run-note and per-step status/note drafts keyed by copied run-step IDs. Allow only notes on run PATCH and status/notes on step PATCH. Normalize outer note whitespace, preserve interior newlines, send null to clear persisted notes, omit unchanged fields and skip no-op/empty PATCH requests. Never spread the run response into a write body.

Serialize writes per run using synchronous guards plus visible pending feedback. Disable mutation actions while a write is pending and freeze submitted inputs; unrelated drafts can remain editable. Reconcile submitted values with returned saved values, update pristine drafts, preserve unrelated dirty drafts. This avoids response-order ambiguity without introducing a write queue. Discard restores the current saved baseline. Unsaved drafts are local and are not recovered after reload.

### Completion

Require no pending writes and no dirty run/step drafts before opening completion. Show save-or-discard guidance when blocked. Use a keyboard-accessible confirmation dialog with explicit terminal outcome, no automatic default derived from steps, and an irreversible/read-only warning. Cancellation sends no request. Notes remain managed through the existing explicit save, avoiding a second completion-note draft.

Passed eligibility uses persisted steps: zero steps are eligible; otherwise all must be passed/skipped with at least one passed. Other outcomes allow unresolved steps. Confirm calls only the dedicated completion endpoint. Guard duplicate confirmation. Successful completion removes edit controls and displays immutable saved values. A generic run-status selector is rejected because terminal PATCH also finalizes in the backend.

### Failure and conflict recovery

Validation/network failures retain drafts with actionable feedback. Ambiguous start reports that a run may have been created, does not navigate or retry automatically, and allows a later explicit start only with clear warning that it could create another run. Reliable recovery through history belongs to #93; no idempotent recovery is promised.

On step/save/completion 409, refetch authoritative detail. If still active, retain dirty drafts and display the validation/conflict feedback without replay. If completed, render authoritative read-only results without claiming the local write succeeded; warn about rejected unsaved edits and retain their text for review/copy within the current scope. A failed refresh shows retry feedback and blocks further writes until authoritative state is recovered. A completion response lost in transit likewise requires refetch before another completion attempt.

Show loading, retryable error and scoped 404 states. Run detail never depends on fetching the live source scenario; deleted source and nullable executor receive clear fallbacks. Guard all post-await updates, navigation and notifications against abandoned scopes.

## Risks / Trade-offs

- Ambiguous start can leave an undiscoverable run before #93 → explicit uncertainty feedback; no automatic replay or recovery claim.
- Backend last-write behavior does not detect all stale active edits → serialize local writes and promise no cross-session merge protection.
- Generated cache invalidation/refetch can overwrite drafts → separate baselines and reconcile only submitted/pristine values.
- Completed conflicts can strand local observations → retain rejected text for review/copy while preventing edits to the completed record.
- Backend branch remains unmerged with conflicts → local integration is available; final integrated contract regeneration remains required before delivery.
- Structured-authoring browser QA is incomplete → verify start prerequisites live and preserve the separate checklist.

## Migration Plan

Implement generated contract integration and consumers together, validate payloads and scope isolation, then run lint/tests/build and authenticated browser QA against the migrated local backend. No client data migration or new dependency is required. This client change authorizes no further backend/database modifications. Deploy with a compatible integrated backend contract; rollback removes the execution UI without deleting persisted run history or reversing migrations.
