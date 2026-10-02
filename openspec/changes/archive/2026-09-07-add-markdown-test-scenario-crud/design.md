## Context

The current branch builds on the completed `add-project-scoped-test-scenario-list` change, which provides a protected, project-guarded catalog, selected-project isolation, pagination, and generated Test Scenario types. Catalog rows are deliberately non-interactive today. Elsewhere, row and card actions use a shared `ContextMenuButton`, `useOpenContextMenu`, and global `ContextMenu` presentation.

The locally running backend OpenAPI document exposes create, project-scoped detail, project-scoped PATCH, and project-scoped delete operations. Create requires `projectId`, `title`, and `contentMd`. PATCH accepts either title or `contentMd`, allowing a request to contain only changed fields. Generated mutations invalidate the shared `Test Scenarios` RTK Query tag.

The client already uses React Hook Form with Zod for form ownership, an application dialog registry for confirmation workflows, shared API-error extraction and toasts, and React Markdown with GFM for skill previews.

## Goals / Non-Goals

**Goals:**

- Keep route/query state ownership separate from presentational authoring controls.
- Keep ordinary title navigation read-only and require an explicit Edit action before mutable controls appear.
- Preserve `contentMd` byte-for-byte at the client boundary through edit, preview, create, and update flows.
- Make selected-project changes synchronously remove stale detail and unsaved form state.
- Derive PATCH payloads deterministically from the last persisted response.
- Reuse established form, Markdown rendering, dialog, feedback, and query patterns.
- Reuse the existing application context-menu trigger and global menu behavior for row actions.

**Non-Goals:**

- Preserving unsaved edits across navigation or project changes.
- Warning about unsaved navigation in this iteration.
- Editing scenario relationships, execution evidence, or observed issues even when generated endpoints exist.
- Autosave, drafts, revision history, optimistic locking, or conflict resolution.
- Rendering raw HTML embedded in Markdown.

## Decisions

### Use separate route-level pages for details and editing

Add `/test-scenarios/new`, `/test-scenarios/:scenarioId`, and `/test-scenarios/:scenarioId/edit` path constants and compose all three routes with `ProtectedRoute` and `ProjectGuard`. A scenario title links to the read-only details page. The context menu's **Edit Scenario** option navigates only to the edit page.

Use separate route-level page components rather than a single page with a mutable `edit` state. The details page renders the persisted title and Markdown preview without form fields or save controls, leaving a stable surface for future scenario relationships and evidence. Its header renders one scenario-labelled `ContextMenuButton`; the shared menu exposes **Edit Scenario** and **Delete Scenario**. The edit page owns the authoring form and PATCH lifecycle. Both pages may share project-scoped retrieval, loading, unavailable, and error primitives underneath.

The create page continues to share the authoring form with the edit page. Successful creation navigates with `replace` to the returned read-only details URL so refreshing does not resubmit the create page.

Alternative considered: one details page with an `edit` state. Although it reuses more component state directly, the URL would not communicate mutability, title clicks could unexpectedly expose editing controls, and future details-page expansion would remain coupled to the form lifecycle.

### Reuse the shared context-menu pattern for table actions

Append a narrow final table column with no visible header text. Each row renders `ContextMenuButton` with a scenario-specific accessible label and delegates its click event plus the summary record to a `useTestScenarioContextMenu` hook. That hook uses `useOpenContextMenu` to expose **Edit Scenario** with `FiEdit` and **Delete Scenario** with `FiTrash2`, matching existing project and result action patterns.

Use the same `useTestScenarioContextMenu` handler for both catalog-row and details-page triggers. **Edit Scenario** closes the menu through the shared menu behavior and navigates to `/test-scenarios/:scenarioId/edit`, while the row's title navigates to the read-only `/test-scenarios/:scenarioId` page. **Delete Scenario** closes the menu and opens the Test Scenario delete dialog with `scenarioId`, current `projectId`, and persisted `title`. Each trigger prevents propagation through the existing context-menu opener.

Alternative considered: inline or standalone edit/delete buttons. Separate buttons make the catalog and details header noisier and diverge from the application's established secondary-action pattern.

### Key request and form boundaries by project and scenario identity

The route boundaries will read the selected project and render keyed details or edit content. Both routes use the same generated detail query contract with `{ scenarioId, projectId }` and presentation consumes only data associated with the current arguments. Shared retrieval may be implemented as a reusable hook or state-view primitives, but the read-only and editable page components remain distinct. Changing project identity remounts route content before the new request completes, discarding previous-project data and edit state and preventing stale Markdown from flashing.

Malformed or missing route IDs and project-scoped 404 responses will use one unavailable-scenario presentation with a catalog return action. Other request failures will use a retryable error state.

Alternative considered: update form values in an effect without remounting. That permits a render containing stale values and requires more defensive state synchronization.

### Keep persisted values separate from editable values

Use React Hook Form only on the create and edit pages for editable `title` and `contentMd`. The details page consumes persisted query data directly. On edit-query success and after each successful mutation, reset the form from the returned persisted record and retain that record as the comparison baseline.

Create validation will require a title with at least one non-whitespace character and `contentMd.length >= 1`. The Markdown schema must not call `trim`, preprocess, normalize, parse, or serialize `contentMd`. The persisted mutation response is authoritative for title normalization.

For updates, compare submitted values to the persisted baseline and construct a payload containing `title`, `contentMd`, or both. A no-op save will not call PATCH. Mutation guards and disabled actions prevent duplicate submissions.

Alternative considered: rely only on React Hook Form's dirty-field map. Reset and user reversion behavior can leave dirty metadata different from actual persisted equality, while direct comparison produces the exact API payload contract.

### Share Markdown rendering without coupling to the Skills domain

Extract the reusable React Markdown/GFM rendering and link hardening from the skill-specific preview into a neutral UI Markdown preview component, then keep the skill wrapper or update the skill detail to use the shared primitive. Scenario preview receives the current watched `contentMd` value and never writes a transformed value back to the form.

The details page always uses the shared Markdown renderer. On the edit page, Source and Preview modes will be explicit tabs or a segmented mode control, and only Source is editable. Raw HTML remains escaped because no raw-HTML plugin is added.

Alternative considered: reuse `SkillMarkdownPreview` directly. That couples Test Scenario authoring to another feature domain and makes future preview styling ownership unclear.

### Keep mutation feedback local and use generated cache invalidation

Create, update, and delete containers will use generated hooks and `unwrap()` so validation and server failures can be displayed near the relevant action using `extractApiError`. Success toasts provide confirmation, while inline errors retain actionable context.

The generated `Test Scenarios` invalidation tag is sufficient to refresh active catalog/detail queries. Deletion may start from either the catalog or details page. After success, the dialog closes and its completion callback navigates to `/test-scenarios`; the active catalog request is refreshed and the deleted record will no longer be presented. No optimistic cache removal is required.

Alternative considered: manually patch every cached list page. That adds pagination and project-key complexity without improving the required post-navigation behavior.

### Require exact-title confirmation in the deletion dialog

Add a Test Scenario alert dialog through the existing dialog registry. It receives `scenarioId`, `projectId`, and the persisted title, renders a text input, and enables its destructive action only when the input equals the title with a case-sensitive, whitespace-sensitive comparison. The submit handler repeats this equality guard before calling the generated delete mutation, so UI state cannot bypass the protection.

The dialog owns confirmation input, pending, and inline error state. Input is empty each time a new dialog opens, remains available after a failed request, and is cleared when the dialog closes. Extend the dialog launcher with a successful-deletion callback so both the table context menu and details-page action reuse the same protected behavior and redirect to the catalog only after the mutation succeeds. Generated tag invalidation then refreshes the catalog.

Alternative considered: browser-native confirmation. It cannot present consistent pending or server-error feedback and diverges from established application behavior.

## Risks / Trade-offs

- [The generated file includes Test Scenario relationship and evidence endpoints outside this scope] → Use only the four CRUD hooks required here and avoid exposing unrelated UI.
- [A backend contract changes while client work proceeds in parallel] → Generate from the locally running OpenAPI source before implementation validation and keep focused compile-time contract tests for mutation arguments and responses.
- [Large Markdown documents make live preview rendering expensive] → Render only while Preview mode is active; do not parse the source during editing.
- [Project switching discards unsaved edits] → Treat this as an explicit non-goal and remount immediately to preserve the stronger cross-project isolation guarantee.
- [Broad tag invalidation refetches more Test Scenario data than necessary] → Accept the current generated behavior for correctness; introduce entity-specific tags only as a separate generated-contract improvement.
- [Scenario titles may contain leading or trailing spaces in stale data] → Compare the confirmation input with the persisted title exactly and do not trim either value.
- [Shared retrieval logic could recouple the two pages] → Share only query/error primitives; keep read-only presentation and edit form ownership in separate page-level components.

## Migration Plan

1. Confirm or regenerate the authenticated API from the running local OpenAPI document and review the generated diff.
2. Add shared validation and Markdown preview primitives.
3. Add separate details and edit routes/pages, shared retrieval primitives, the catalog action column and context menu, authoring mutations, and exact-title deletion confirmation.
4. Add focused behavior and contract coverage, then run full repository and strict OpenSpec validation.

Rollback consists of reverting the routes, catalog affordances, authoring feature files, shared-preview extraction, tests, and any generated API update together. The change adds no client-persisted state or backend migration.
