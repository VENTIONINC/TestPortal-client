# Spec Delta

## ADDED Requirements

### Requirement: Catalog supports combined server-side search and organization filters
The catalog SHALL combine the selected project, optional folder or suite filter, search, sorting, and pagination in server requests.

#### Scenario: Search within a folder
- **WHEN** a user enters a search term while viewing a folder
- **THEN** the client SHALL request the backend scenario list with the project ID, folder UUID, descendant mode, search term, and current pagination
- **AND** SHALL show only server-matched summaries and totals

#### Scenario: Open a suite
- **WHEN** a user selects a suite
- **THEN** the client SHALL request the scenario list with that suite UUID and selected project ID
- **AND** SHALL use returned pagination metadata rather than filtering the current page locally

### Requirement: Catalog can bulk-organize scenario summaries
The catalog SHALL provide explicit bulk operations to move selected scenarios to a folder or Unfiled and add or remove them from a suite.

#### Scenario: Selection exceeds operation limit
- **WHEN** a bulk selection contains more than 100 scenarios
- **THEN** the client SHALL prevent submitting it and explain the operation limit

#### Scenario: Bulk operation succeeds
- **WHEN** the backend confirms a bulk organization operation
- **THEN** the client SHALL clear or reconcile the selection and refresh the affected server-backed lists
