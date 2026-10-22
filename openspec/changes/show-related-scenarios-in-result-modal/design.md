## Context

The existing `AssignIssueModal` opens from a Result error ID. Its project-scoped modal-context response includes `result.id` but no linked scenarios or database Spec ID. `ContextTabs` owns the left evidence rail and currently renders Error, optional Logs, Snippet, and Test Case tabs; when no optional evidence exists, it skips the rail entirely. The backend change in VENTIONINC/TestPortal-backend#116 adds `relatedTestScenarios` only to the authenticated Result detail response, while the generated client still types that response as the shared `Result`.

The client already has a safe `MarkdownPreview` component. The current Test Scenario authoring screens intentionally display structured fields rather than generated Markdown. This change allows read-only Markdown only in the Result modal's evidence context, as specified in the `test-scenario-authoring` delta.

## Goals / Non-Goals

**Goals:** Keep scenario inspection inside the modal and issue form state intact; use current explicit backend links with project isolation; make request and empty states truthful; preserve the distinction between detail and list Result contracts.

**Non-Goals:** Create or remove Spec links, invent per-Result assignments, show AI-suggested scenarios, add a standalone Result page, or open the modal for Results without an error.

## Decisions

### 1. Fetch the Result detail only for the scenario tab

Use the generated Result detail query with `context.result.id` and the modal's `projectId` when the Test Scenarios tab is active. Keep the existing modal-context query for error evidence and issue assignment. Render only data for the current query arguments, and refetch on tab entry so a newly added/removed link or edited Markdown appears on subsequent inspection. The Result detail endpoint is separate from the modal-context endpoint and its four-field summaries already contain everything needed for this view.

Adding scenarios to the result-error modal-context backend response was considered, but would duplicate the new Result detail contract and couple unrelated issue-assignment reads to scenario content. Eagerly fetching Result detail whenever the modal opens was considered, but would add a potentially large Markdown payload to users who never open the tab.

### 2. Keep scenario navigation inside the evidence pane

Place an accessible Test Scenarios tab immediately after Logs in the vertical rail. Render the rail even when the selected error has no optional Logs, Snippet, or Test Case evidence. The tab first shows linked scenario titles in backend order; selecting one shows its title, nullable details, and `contentMd` via the existing read-only Markdown renderer, with an in-pane return action. The right issue-assignment pane remains mounted so tab and scenario changes cannot reset unsaved form state.

Navigating to `/test-scenarios/:scenarioId` was considered, but would close the modal and lose the investigation context. Fetching each full scenario detail was considered, but the Result detail response already provides the current content needed here and avoids additional requests.

### 3. Treat an empty link set differently from request failure

Only a successful `relatedTestScenarios: []` response produces the no-links message. Loading, 404/unavailable, and other failures have separate states; failures offer retry where useful. Query identity includes both Result and project IDs. A stale response or cached data for a previous scope must never be rendered after either changes. The tab does not derive scenarios from Result lists, client-side matching, or AI suggestions.

### 4. Regenerate the authenticated API contract

Generate the main RTK Query declarations from an OpenAPI document containing the backend `ResultDetail` and `RelatedTestScenarioSummary` schemas. Keep generator-owned code unedited by hand. Review the generated diff for unrelated contract drift, particularly because backend PR #117 is stacked on the manual-run branch. Any cache-tag refinements belong in `extendedApi`, not the generated file.

## Risks / Trade-offs

- [Generated Markdown can be lengthy] → Fetch it only when the tab is used and keep scrolling within the evidence pane.
- [Scenario links or content may change while the modal is open] → Refetch on tab entry and on retry; present the response as current coverage rather than a historical snapshot.
- [The modal is opened through an error ID] → Limit this proposal to the existing error-based entry points; the backend's all-status contract remains available to future client flows.
- [A user may mistake a Spec link for a link to one execution] → Label the empty state and explanatory copy as coverage of the Result's Spec, and reserve attachment controls for a separately specified flow.

## Migration Plan

Ship the generated detail contract and modal tab together after the backend endpoint is available in the target environment. Existing modal paths remain usable while the new tab is loading or unavailable. Rollback removes the tab and its detail query; no client or backend data migration is required.
