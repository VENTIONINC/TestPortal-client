# Proposal

## Why

The `/test-scenarios` catalog currently offers only one global sort selector and a broad search field. Users cannot combine a sort on one scenario attribute with a filter on another, making large catalogs harder to scan and narrow efficiently.

## What Changes

- Add per-column sort controls for Scenario key, Title, Details, Folder, Created by, Created, and Updated.
- Add per-column search/filter controls for Scenario key, Title, Details, Folder, and Created by.
- Allow column filters to be combined with the selected sort and with the existing global search.
- Keep the global search and make it more compact; remove the separate Sort by selector.
- Use Recently created as the default ordering.
- Extend the scenario-list API contract and backend behavior as needed to support the requested sorting and filters.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `test-scenario-catalog`: define independent column sorting and filtering, default ordering, and global-search behavior.

## Impact

- Client catalog table, column controls, query state, and generated API bindings.
- Test Scenario list API schema, validation, filtering, sorting, and OpenAPI documentation in the backend.
- Existing pagination, folder/suite scoping, and global search must continue to work with the new query parameters.
