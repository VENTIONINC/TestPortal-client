# Spec Delta

## ADDED Requirements

### Requirement: Catalog supports single-column sorting
The catalog SHALL sort the server-backed result set by one selected table column at a time.

#### Scenario: Sortable column headers
- **WHEN** the catalog displays its scenario table
- **THEN** Scenario key, Title, Details, Folder, Created by, Created, and Updated SHALL expose sort controls in their column headers
- **AND** activating a different column SHALL sort by that column in descending order
- **AND** activating the selected column again SHALL reverse its sort direction

#### Scenario: Default ordering
- **WHEN** the catalog opens or the selected project changes without an explicit user-selected sort
- **THEN** scenarios SHALL be ordered by creation time descending, with ID descending as the deterministic tie-breaker

#### Scenario: Sorting preserves page stability
- **WHEN** scenarios have equal values for the selected sort column
- **THEN** the server-backed list SHALL use deterministic ID-based tie-breaking so records remain consistently ordered across pages

### Requirement: Catalog supports independent column filters
The catalog SHALL combine eligible column filters with global search, catalog scope, sorting, and pagination in the server-backed list request.

#### Scenario: Filter by a column while sorted by another
- **WHEN** a user sorts by one column and enters a search term in another eligible column
- **THEN** the catalog SHALL preserve the selected sort and apply the filter before sorting and pagination
- **AND** pagination SHALL reflect the filtered result total

#### Scenario: Combine multiple column filters
- **WHEN** a user enters non-empty search terms in multiple eligible columns
- **THEN** the catalog SHALL apply all active column filters together using AND semantics

#### Scenario: Searchable column headers
- **WHEN** the catalog displays its scenario table
- **THEN** Scenario key, Title, Details, Folder, and Created by SHALL expose search controls in their column headers
- **AND** Created and Updated SHALL NOT expose search controls

#### Scenario: Text filters match displayed data
- **WHEN** a user enters a non-empty filter for an eligible column
- **THEN** matching SHALL use a case-insensitive literal substring of the corresponding displayed value
- **AND** the Folder filter SHALL match the complete folder path with ancestor names separated by ` / ` or the displayed `Unfiled` value
- **AND** the Created by filter SHALL match the displayed creator name or email
- **AND** Scenario key and Details filters SHALL match persisted values rather than presentation placeholders

#### Scenario: Empty filters do not restrict results
- **WHEN** a user clears a column filter or enters only whitespace
- **THEN** the client SHALL omit that filter from the request
- **AND** clearing one filter SHALL preserve all other active filters

#### Scenario: Global search remains independent
- **WHEN** a user enters the existing global search together with one or more column filters
- **THEN** global title-or-key matching and every active column filter SHALL apply together

### Requirement: Catalog uses the compatible list sorting contract
The catalog SHALL use the new column sort parameters without changing the behavior of existing list clients.

#### Scenario: Column sort request
- **WHEN** the user selects a sortable column
- **THEN** the catalog SHALL send its corresponding `sortField` and `sortDirection`
- **AND** it SHALL omit the legacy `sort` preset parameter from that request

#### Scenario: Default sort request
- **WHEN** the catalog loads with no selected column sort
- **THEN** it SHALL request the default creation-time-descending order without requiring an explicit legacy sort preset

### Requirement: Global search remains available with compact presentation
The catalog SHALL retain its global scenario search independently of column filters.

#### Scenario: Global search controls
- **WHEN** the catalog displays its search controls
- **THEN** it SHALL retain the existing global search for title or scenario key in a compact-width presentation
- **AND** it SHALL NOT display a separate Sort by selector
