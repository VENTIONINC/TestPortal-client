## Context

See proposal.md for motivation and scope. The existing `ResultRelatedScenarios` fetches Result detail on tab entry, uses current query arguments/data for isolation and renders linked summaries or Markdown inspection. `AssignIssueModal` owns the issue form outside that evidence pane. The generated API already exposes POST/DELETE Spec links but its catalog arguments lack search. Link endpoints invalidate `Test Scenarios`; the dedicated Result-detail endpoint provides `Results`, so existing writes do not refresh modal coverage.

The served local OpenAPI inspected on 2026-10-02 documented title/scenarioKey search, explicitly excluding details, plus Spec UUID, related summaries and link operations. This is prior contract evidence, not authenticated behavior or deployment acceptance; reverify the implementation environment. The user accepted this search scope. The unarchived #105 viewing change remains a dependency with its own incomplete browser QA.

## Goals / Non-Goals

**Goals:** Extend the evidence pane with coherent local navigation; preserve form ownership; adopt generated contracts and authoritative server state; make completion handling safe across scope changes.

**Non-Goals:** Change modal-context data, synthesize relationships, cache full scenario content for each picker row, or couple link writes to issue assignment.

## Decisions

### 1. Keep management in the existing evidence pane

Use linked-list, picker, inspection and unlink-confirmation views inside the pane. Retain list inspection and Back actions. Keep Link Test Scenario in both successful list states. Provide separate inspect and unlink buttons rather than nesting interactive controls. On confirmed link, return to the refreshed list so the user can select the new scenario. On confirmed unlink, reconcile selection against the authoritative array.

Split presentation from search/navigation/mutation orchestration in a dedicated hook/container as the existing component grows. Preserve the parent form's mounted identity. Route navigation and a separate top-level modal were considered, but both make draft/focus preservation harder. Restore focus to the invoking action on picker/confirmation cancellation and use existing accessible Chakra controls.

### 2. Apply search explicitly and paginate server summaries

Use separate input and applied trimmed search, an explicit Search action (also Enter), page state and limit 10. Search changes reset page before issuing the new query; page changes retain applied search. Query identity includes project, applied search and page, and only matching currentData is rendered. Label the search as title or scenario key; nullable details are display-only. Keep already linked entries visible and disabled, retaining server totals/order. Handle an empty later page with a return-to-first-page action without calling it an empty catalog.

Client filtering of a loaded page was rejected because it misses candidates. Debounced search was considered but explicit application gives predictable page reset and retry state. Creator/sort controls remain outside this picker.

### 3. Use generated writes and guarded context transitions

Read specId only from matching Result detail. Capture `{ projectId, resultId, specId, scenarioId }` plus a context generation for each write. Disable submission synchronously while pending, not solely through a rendered loading flag. Set `extraOptions: { maxRetries: 0 }` for both link mutations in non-generated API enhancements; the base query otherwise retries transport/5xx failures. Auth refresh remains the existing API behavior.

Scope changes reset management state and advance the generation; unmount invalidates completion handlers. Apply local navigation/feedback only if the captured generation/scope is current. Query cancellation is useful for obsolete reads, but is not proof that a sent server write was cancelled. Old writes may invalidate only original project caches. Reset ephemeral state on new modal context; tab changes within that context preserve the issue draft.

### 4. Refresh server data after writes and conflicts

Enhance generated link endpoints to invalidate scenario-link caches and project-scoped Result-detail coverage tags. Add a compatible project coverage tag to the dedicated detail query through a non-generated enhancement imported by its consumers. Include other generated Result-detail consumers where applicable. Use a project coverage tag because mutation arguments identify the Spec, while cached Result IDs may be unknown. This may refetch more subscribed details but correctly refreshes all Results of that Spec without adding a Spec-discovery endpoint. Keep cache changes outside generator-owned files.

Explicitly await a current-context Result-detail refresh to reconcile the visible list and selection. On 409, keep picker state, explain Already linked and refresh coverage; disable the conflicting entry once confirmed. On 404, refresh coverage and picker data, retain useful search and explain the unavailable target. Other recoverable failures retain input and offer explicit retry. For transport uncertainty, explain that the outcome is unknown and provide refresh before retry. A successful write followed by failed refresh gets saved-but-refresh-failed feedback, not write-failed feedback or a fabricated list. Do not optimistically insert a scenario without authoritative Markdown.

Global broad invalidation was considered, but project coverage tags avoid refreshing unrelated projects. Invalidating only the current Result was rejected because another cached Result can share the Spec.

### 5. Regenerate from the integrated contract

Verify search semantics, summary labels, Result Spec identity, POST body/status 201/409/404 and DELETE status 204/404 in the served OpenAPI. Regenerate affected API declarations using the existing generators or a focused generation configuration when full regeneration introduces unrelated drift. Preserve the dedicated Result-detail endpoint and review its generator operation identity against the served contract. Never patch generated types by hand. Existing catalog consumers can continue omitting search.

## Risks / Trade-offs

- [Issue wording includes details search] → Proposal/specs explicitly capture the accepted title/key scope; do not claim full original search wording was delivered.
- [A write succeeds but its response is lost] → No automatic write retries; refresh authoritative data and explain uncertainty before explicit retry.
- [Concurrent linking/unlinking changes selection] → Treat 409/404 as reconciliation cases and clear absent inspected selections after successful refresh.
- [Old completion arrives after context changes] → Guard local completion handlers with scope/generation; retain original-project cache invalidation.
- [Project coverage tags cause extra reads] → Accept bounded refetching initially; optimize only with evidence without weakening same-Spec freshness.
- [Parent evidence/form mounting changes during refactor] → Test the actual modal with issue name, description and category edits, not only a standalone pane.

## Migration Plan

No database migration is required. Verify the target served contract, regenerate and review API changes, implement the pane and cache enhancements, then run focused tests and repository lint/test/build. Browser QA must prove persisted link/unlink after reload and coverage from another Result of the same Spec. Record unavailable live fixtures separately rather than marking them complete from mocked tests. Rollback removes management controls/enhancements while retaining #105's viewing flow; already persisted associations remain valid backend data.
