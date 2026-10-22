# Design

## Context

The catalog already requests a paginated server-side list with project, folder/suite scope, a global search term, `createdById`, and a single sort enum (`recently_created`, `recently_updated`, `title_asc`). The default is recently created. The requested column searches and most column sorts are not represented by the current API contract. See `proposal.md` and `specs/test-scenario-catalog/spec.md` for scope and behavior.

## Goals / Non-Goals

**Goals:**

- Keep filtering, sorting, organization scope, and pagination in one server-backed scenario-list request.
- Support one active sort column and direction at a time, independently of any number of active column filters.
- Keep global search available in a compact layout.

**Non-Goals:**

- Multi-column ordering or sorting only the currently loaded page.
- Searching scenario Markdown/content that is not displayed in the catalog.
- Adding search controls to Created or Updated.

## Decisions

- Use a single active sort key and direction. Sortable header controls select the key and toggle ascending/descending; the initial state is Created descending to preserve Recently created behavior. This matches the requested sort-one-column plus filter-another workflow. Multi-column sorting is deferred because it was not requested.
- Put sort and search affordances in each applicable column header, with search values managed independently. Apply every active filter in combination (AND semantics), alongside global search and the current project/folder/suite scope.
- Extend the list API rather than sorting or filtering the current page in the browser. The backend must validate the sort key/direction and column-filter fields, apply them before pagination, and return matching totals. This preserves correct behavior across pages.
- Treat text filters as case-insensitive substring searches against the displayed value. Folder filtering uses the displayed folder path; creator filtering matches the displayed name or email. Empty values remove that column's restriction. Preserve the existing global search over title and scenario key.
- Keep the separate global search input, but give it a compact maximum width on wider screens and allow it to use available width on small screens. Remove the global Sort by selector after header sorting is available.
- Update the backend OpenAPI contract and regenerate the client API types/hooks so the UI uses the same typed request parameters.

## Risks / Trade-offs

- Filtering by a displayed folder path and creator name/email requires joining related data before pagination → implement the predicates in the backend query and verify counts and page boundaries.
- Concurrent typing in several header filters can issue excessive requests → debounce text input and reset to page 1 whenever search or sort state changes.
- Header controls can crowd a responsive table → use compact accessible icon buttons and popovers, preserve clear accessible names, and keep the table horizontally scrollable where needed.
- A backend and client rollout mismatch can reject new query parameters → deploy the backend contract before or together with the client, and keep default requests compatible.

## Migration Plan

1. Extend and document the backend list query, including sort fields/direction and per-column filters; deploy it compatibly with existing clients.
2. Regenerate client API bindings and implement the header controls and query state.
3. Remove the old Sort by selector and verify the default and combined-filter flows.
4. Roll back by reverting the client UI first; the added optional backend query parameters do not require a data migration.
