## Context

The client already centralizes authenticated API access in `baseApi`, generates endpoint types and hooks into `generatedApi.ts`, stores the selected project in the projects slice, and composes protected pages with `ProtectedRoute`, `ProjectGuard`, and `MainTemplate`. Navigation comes from `PATHS` and `navigationMenuConfig`, while a shared `Pagination` component implements page selection.

The running backend OpenAPI document at `http://127.0.0.1:3001/api/openapi.json` defines an authenticated `GET /api/v2/test-scenarios` operation with required `projectId`, optional `page` and `limit`, and a paginated response.

The generated API file may also reflect unrelated differences between the checked-in client contract and the running backend document. Implementation must keep the generated output exact while reviewing those differences rather than hand-editing generated declarations.

## Goals / Non-Goals

**Goals:**

- Integrate the current authenticated scenario-list operation through generated RTK Query code.
- Fit the catalog into existing route, project selection, page-template, status, and pagination patterns.
- Present scenario summaries in a compact table with fixed **Title**, **Created**, and **Updated** columns.
- Make project changes reset pagination synchronously and prevent stale cross-project records from rendering.
- Keep the catalog compatible with the planned lightweight list response by consuming only stable summary fields.
- Separate query/state ownership from presentational rendering so request behavior and visible states can be tested independently.

**Non-Goals:**

- Adding a temporary handwritten API endpoint or editing generated API declarations by hand.
- Adding scenario detail navigation or any scenario mutation workflow.
- Rendering, parsing, truncating, or caching Markdown specifically for catalog presentation.

## Decisions

### Generate the endpoint from the running OpenAPI document

Run the existing generator with `RTK_QUERY_OPENAPI_URL=http://127.0.0.1:3001/api/openapi.json` so the Test Scenario hook and types use the same authenticated `baseApi` as other REST operations. Generated output remains wholly generator-owned, and an explicit contract test will pin the list arguments and metadata needed by the catalog.

Alternative considered: inject a handwritten endpoint into `extendedApi`. This would avoid unrelated generated diff but would duplicate a documented endpoint and undermine issue #78's generated-contract requirement.

### Use a page, query container, and presentational catalog table

Add a Test Scenarios page under `src/pages/`, with feature code under `src/components/test-scenarios/`. The page supplies the standard template. A container obtains the selected project, owns page state, calls the generated query, and translates query state into explicit view props. A presentational view renders scenario summaries as table rows beneath **Title**, **Created**, and **Updated** headers, places pagination controls below the table, and renders status states outside the table without access to Redux or RTK Query.

Alternative considered: keep query logic and all state branches directly in the page. That is smaller in file count but makes project-switch and stale-data behavior harder to test and diverges from the repository's feature container/view patterns.

### Reset state through selected-project identity

Key the state-owning catalog container by `selectedProjectId`, with page state initialized to 1 inside that keyed boundary. A project change therefore creates a fresh page state before the new query is issued rather than relying on an effect that runs after an intermediate render. Pass `projectId`, `page`, and an explicit limit of 10 to the generated hook.

Use the query result associated with the current arguments for rendering. During an argument change, the view shows the new request's loading state rather than retaining data from the old project. RTK Query's argument-keyed cache may still satisfy repeat visits, but only data keyed to the current project and page can render.

Alternative considered: reset `page` in an effect that watches `selectedProjectId`. That can briefly issue a request for the new project using the old page and complicates the guarantee that the first new-project request is page 1.

### Consume a deliberate summary projection in the view

Map each API record to view data containing only `id`, `title`, `createdAt`, and `updatedAt`. The presentational view never receives `contentMd`. Dates use the repository's established human-readable formatting style, and scenario IDs provide stable render keys.

Alternative considered: pass generated `TestScenario` objects directly to the table. That is less code but allows catalog components to start depending on `contentMd` and couples presentation to the full response shape.

### Keep the list non-interactive beyond pagination

Scenario table rows will not navigate or expose an affordance that implies detail support. The sidebar entry itself remains a normal link, matching existing navigation behavior. Detail navigation can be introduced with the separate CRUD/detail capability without changing the foundation route.

## Risks / Trade-offs

- [Generated output includes unrelated backend contract drift] → Review the generator diff, retain exact generated output, and use compile-time contract tests to surface incompatible changes before implementation proceeds.
- [The API record contains fields the catalog does not present] → Map API records to explicit summary view data before rendering.
- [A selected project changes while a request is in flight] → Key state by project identity and render only current-argument query data so late responses remain isolated in their own RTK Query cache entry.
- [Zero-page responses use `totalPages: 0`] → Render pagination only when `totalPages > 1`; the empty state does not pass zero into an interactive paginator.

## Migration Plan

1. Regenerate the API from the running backend and review the generated contract diff.
2. Add the path, guarded route, navigation entry, page, container, summary mapping, and view states.
3. Add focused contract, navigation, route, catalog, pagination, and project-switch tests.
4. Run the repository validation commands before delivery.

Rollback consists of reverting the route/navigation and feature files together with the corresponding generated API update. No client-persisted data or backend migration is introduced by this change.
