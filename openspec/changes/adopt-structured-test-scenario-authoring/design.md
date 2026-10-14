## Context

See proposal.md for motivation and scope. The synced baseline includes generated structured inputs and four step hooks, but existing forms still author Markdown. The detail hook stores a persisted response; the shared form resets when title/details/contentMd change. Reusing that reset behavior after step mutations would erase unrelated field drafts.

The live backend accepts nonblank trimmed text, optional create fields, nullable PATCH fields, and nonempty PATCH objects. Every step mutation returns full detail. Reorder requires every current step ID exactly once; membership rejection is HTTP 400. Detail includes generated Markdown/hash/version; summaries contain neither body nor steps.

## Goals / Non-Goals

**Goals:** Keep persisted server data separate from editable drafts; use generated operations within existing route/container/view boundaries; make failures recoverable without false success.

**Non-Goals:** No client renderer for scenario documents, optimistic step mutations, new state library, drag-and-drop dependency, or cross-client conflict resolution. Product exclusions are listed in proposal.md.

## Decisions

### 1. Explicit structured payloads

Replace the authoring schema and payload helpers with an allowlist of title/details/objective/preconditions/testData/expectedResult/notes. Trim outer whitespace while preserving interior line breaks. Omit empty optional create values; compare normalized edit values against saved values and send null only for clearing persisted optional text. Skip empty PATCH requests. Never spread full detail into write bodies.

Creation owns a local ordered initial-step array with temporary UI keys. Serialize only action and optional expectedResult. Persisted steps use backend IDs; display position + 1. This keeps new-step editing local and makes creation atomic instead of issuing follow-up append calls.

### 2. Separate field save and persisted step operations

Retain explicit scenario Save. Add a step section with independent Add, Save step, Delete step, Move up and Move down controls. Use separate forms or button handlers to avoid nested HTML forms and accidental scenario submits. Boundary move controls are disabled and all controls have meaningful accessible names.

Serialize writes per scenario while retaining per-operation loading/error feedback. Disable mutation controls during a write and guard duplicate calls synchronously. Field inputs can be disabled for their own field save; unrelated field drafts remain editable during step writes. Do not reset those drafts on full-detail step responses.

Alternatives: drag-and-drop adds complexity without satisfying an additional requirement; parallel writes introduce response-order ambiguity. Neither is needed for this scope.

### 3. Saved snapshot and draft reconciliation

Keep a saved detail snapshot keyed by projectId/scenarioId and separate field and per-step drafts. Initialize once for a scope; changing project or scenario unmounts/resets all drafts. Successful field saves establish the submitted fields' returned values as their new baseline. Step responses replace saved steps, but preserve dirty scenario fields and unrelated step drafts keyed by stable IDs. Synchronize pristine fields with refreshed saved values; do not globally reset the form on contentMd changes.

Remove or extend the old hand-written response equality comparison so all structured fields, steps and projection metadata are observed. Guard post-await navigation, toasts and state changes against abandoned scopes, including create completion after a project switch. Existing boundaries and currentData checks remain the isolation foundation.

### 4. Cache consistency and structured presentation

Use generated hooks and argument keys containing both scenarioId and projectId. Apply successful full responses to the corresponding detail cache/snapshot and refresh affected summary queries. Existing broad Test Scenarios tag invalidation is acceptable initially; any refinement belongs in a non-generated API enhancement. Do not manually edit generated declarations. Preserve safe creator metadata, Details fallback, 10-row pagination and summary-only rendering.

Show saved structured fields and ordered steps on detail and structured editing controls on edit. Do not expose contentMd as a preview, raw source, or separate Markdown page. Generated Markdown and hash/version remain integration metadata.

### 5. Failed reorder and missing resources

For a rejected reorder membership request, report failure, refetch current detail, and require an explicit retry based on the refreshed step list. Never replay the obsolete ID list. Preserve unrelated field drafts. An unavailable refresh must leave an error/retry state, not claim ordering succeeded. Use existing missing-scenario behavior for scenario 404; a missing step triggers current-detail refresh and actionable step feedback.

The contract does not detect a concurrent reorder with unchanged membership. No version precondition or merge resolution is promised.

## Risks / Trade-offs

- Full-detail refetch overwrites drafts → reconcile pristine values only and test field drafts across every step operation.
- Late response belongs to an old project → keyed boundaries plus post-await scope guards.
- Generated types allow empty update objects despite runtime rejection → schema/payload helpers enforce nonempty writes and no-op saves.
- API generation exposed seven TypeScript errors → update payload consumers and full-detail fixtures as part of implementation, then run complete validation.
- Older summary change remains active → preserve its behavior and user-confirmed QA record; do not mark or archive its unchecked tasks as part of this change.

## Migration Plan

The initial commit contains the synchronized API and specs. Implement consumers and regression fixtures together, validate against port 3001, then deliver the compatible client with the structured backend. No client data migration is required; missing legacy scenario IDs use existing unavailable states. Reverting only the frontend to Markdown authoring would be incompatible with this backend, so rollback requires a coordinated compatible pair or a forward fix. No backend reset or migration is authorized by this client change.
