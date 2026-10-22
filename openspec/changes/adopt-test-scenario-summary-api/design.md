## Context

See proposal.md for motivation and dependencies. The exploration regeneration from port 3001 changed only `generatedApi.ts` (25 additions, one deletion): lists now use generated summaries, full scenarios require nullable details, create accepts optional string details, and PATCH supports nullable details including details-only updates.

The current local summary type is a four-field `Pick<TestScenario>`. Mapping discards all other fields. The catalog hook uses `currentData`; its boundary keys the container by selected project. Detail and edit already share a project-scoped full-scenario query. Three fixture type errors appeared after regeneration: two full-scenario fixtures lack details and a list fixture lacks creator metadata.

## Goals / Non-Goals

**Goals:** Keep API and view types aligned with the local contract while preserving existing query ownership and title/Markdown behavior while adding optional details authoring. Make regression fixtures accurately distinguish list payloads from detail payloads.

**Non-Goals:** Modify backend contracts, introduce creator lookup requests or lifecycle fallbacks, or redesign routing, pagination, and scenario actions.

## Decisions

### Generate from the running development backend

Use `RTK_QUERY_OPENAPI_URL=http://127.0.0.1:3001/api/openapi.json yarn generate-api`. Retain the existing generated diff and inspect any subsequent regeneration for drift; never hand-edit generated declarations. Backend PR merge is not a gate during this coordinated fullstack phase. The default codegen URL remains unchanged because the environment override already provides explicit source selection.

Alternative: wait for backend merge or use the default development URL. Both conflict with the agreed local development source.

### Use the generated summary type throughout catalog data flow

Replace the local `Pick<TestScenario>` definition with an import/re-export of the generated `TestScenarioSummary`. Pass current summary items from the catalog hook to the view without the redundant four-field mapper, removing obsolete mapping helpers and their implementation-mirroring tests. Keep the authored-field PATCH helper in the existing utility module. Context-menu inputs remain the minimal ID/title shape.

Alternative: extend the manual projection. That duplicates a now-purpose-built API summary and creates another place to accidentally drop metadata. Generated summaries contain no Markdown, so direct use does not expose full scenario content to the table.

### Extend the existing table and loading skeleton

Use the column order and fallbacks in the spec. Render details through plain text components with wrapping, and creator name with secondary email. Preserve the current horizontal overflow container, timestamps, title links, and final actions column. Do not fetch users or infer creators from authentication state; use the returned object while retaining its accompanying creator ID.

Alternative: hide details beneath the title or show creator IDs alone. Explicit columns make the new metadata discoverable and name/email distinguish people more usefully than IDs. Missing-creator lifecycle policy remains backend #90; the local contract requires all creator fields.

### Preserve full-scenario retrieval and partial authoring

Keep detail and edit queries separate from the list cache. Full-scenario fixtures gain `details: null` or representative text; summary fixtures gain creator metadata and omit Markdown. Extend form values and PATCH construction with optional plain-text details while preserving title and Markdown semantics. Review the full-scenario equality helper for the newly required details field so its retained response state reflects complete current records, including successful details-only updates.

Alternative: initialize edit from list data. Summaries cannot supply Markdown and would weaken the existing project-scoped detail boundary.

### Author optional details in the shared form

Add a labelled optional Details textarea between Title and Markdown, separate from Markdown Source/Preview. Represent absent details as an empty form string and initialize editing from the full scenario using `details ?? ''`. Trim only the outer whitespace of details at submission, preserving internal whitespace and leaving Markdown byte-for-byte unchanged.

Creation includes a non-empty trimmed details string and omits the property for empty or whitespace-only input because the create contract accepts an optional string, not null. Editing compares normalized details with the persisted baseline: send a changed string, send `null` when clearing non-null details, and omit details when unchanged. Null-to-blank is a no-op. Support details-only and combined PATCH payloads, and retain the existing no-request behavior when all fields are unchanged.

After success, reset form values and the comparison baseline from the full persisted response, including details. On failure retain all entered values for retry. Existing pending-submit protection and project-switch boundaries apply to details as well. Successful mutations continue to invalidate the catalog so it shows the saved details or `No details` after clearing.

Alternative: send empty strings or null for blank creation. Those do not match the agreed create contract. Always sending details on unrelated edits would risk overwriting metadata unnecessarily.

### Compose with active OpenSpec work

Use the additive `test-scenario-summary-consumption` capability because neither catalog nor authoring has a canonical main spec yet. Its metadata requirements extend the earlier catalog's presentation while preserving authoring's title links and actions. When these changes are eventually synced/archived, reconcile the older three-column and non-interactive catalog wording with the combined final behavior. Archival and changes to other proposals are outside this implementation.

## Risks / Trade-offs

- [Local backend evolves before completion] → Regenerate again when the contract changes and review the complete diff before adapting consumers.
- [Fixtures accidentally keep obsolete list fields] → Use separately typed summary fixtures and explicit contract assertions that summaries exclude Markdown and creator fields match the safe shape.
- [More columns increase table width] → Preserve horizontal scrolling and wrap metadata; verify long details and email values in browser QA.
- [Metadata leaks across project changes] → Retain project-keyed state and `currentData`; extend switch tests to assert details and creator isolation.
- [Prior passing tests no longer establish compatibility] → Run focused regressions followed by required lint, test, and build commands; report any unrelated failures separately.

## Migration Plan

1. Verify the pending generator-produced contract against the running local API and update catalog consumers and fixtures together.
2. Validate the summary contract, UI, project switching, cache invalidation, and detail/edit retrieval with focused tests, then run the required full checks.
3. Perform local browser QA against port 3001, including creation with and without details, details-only edits, clearing details, distinct creators, pagination, and detail/edit navigation.

No client storage migration is required. A rollback should restore generated types and consumers together against a compatible backend contract; reverting types alone does not restore an old backend response shape.
