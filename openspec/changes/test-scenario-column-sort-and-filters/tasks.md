# Tasks

## 1. Extend scenario list API

- [x] 1.1 Add validated sort-field and sort-direction parameters plus filters for Scenario key, Title, Details, Folder, and Created by to the Test Scenario list contract in TestPortal-backend; verify schema tests accept supported combinations and reject invalid parameters.
- [x] 1.2 Implement server-side sorting and combined column filters before pagination while preserving project/folder/suite scope and global search; verify integration coverage for each sort field, AND-combined filters, totals, and page boundaries.
- [x] 1.3 Update backend OpenAPI documentation for the list query and verify the generated OpenAPI schema includes all supported parameters and default ordering.

## 2. Implement catalog query state and controls

- [x] 2.1 Regenerate client API bindings from the updated backend schema and verify generated types expose the new query parameters.
- [x] 2.2 Add independent column-filter state, one active sort field/direction, and page reset/debouncing behavior to the catalog hook; verify hook tests cover combined filters, sorting, scope, and pagination arguments.
- [x] 2.3 Add accessible sort controls to Scenario key, Title, Details, Folder, Created by, Created, and Updated headers, plus search controls to the first five; verify component tests cover availability, direction toggling, and search input behavior.
- [x] 2.4 Keep the global title/key search with a compact responsive width, remove the Sort by selector, and verify the catalog presents the compact input and column controls together.

## 3. Verify integrated catalog behavior

- [x] 3.1 Verify a sort on one column remains active while a filter on another column is applied, multiple filters combine, clearing a filter removes only that filter, and pagination reflects server totals.
- [x] 3.2 Verify the initial request uses Recently created ordering and project changes reset search, filters, sort, and pagination without showing results from the previous project.
