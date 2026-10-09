# Spec Delta

## Purpose

Provide a project-scoped way to organize Test Scenarios by canonical folder location and reusable, manually curated suites while retaining the existing scenario records and execution evidence.

## ADDED Requirements

### Requirement: Organization navigation is scoped to the selected project
The catalog SHALL provide entry points for all scenarios, unfiled scenarios, the selected project's folder tree, and its suites.

#### Scenario: Project organization loads
- **WHEN** the catalog opens for a selected project
- **THEN** the client SHALL load that project's folder tree and suites
- **AND** SHALL NOT display organization data from another project

#### Scenario: Project changes
- **WHEN** the selected project changes
- **THEN** the client SHALL clear the selected folder or suite, search, page, and visible scenario records
- **AND** request organization data for the new project

### Requirement: Folder selection filters scenarios on the server
The catalog SHALL use the backend scenario-list API for folder selection, descendant inclusion, search, and pagination.

#### Scenario: Folder includes descendants
- **WHEN** a user selects a folder with descendants enabled
- **THEN** the list request SHALL include the folder UUID and `includeDescendants=true`
- **AND** the returned rows and pagination metadata SHALL reflect all matching scenarios across the folder subtree

#### Scenario: Folder shows direct scenarios only
- **WHEN** a user disables descendant inclusion for a selected folder
- **THEN** the list request SHALL include that folder UUID and `includeDescendants=false`

#### Scenario: Unfiled scenarios are selected
- **WHEN** a user selects **Unfiled**
- **THEN** the list request SHALL use `folderId=unfiled`

#### Scenario: Search and page are combined
- **WHEN** a user searches or changes page within a folder or suite
- **THEN** the client SHALL send the selected project, organization filter, search, and pagination together
- **AND** SHALL display the response's server-calculated totals and page metadata

### Requirement: Folder operations preserve the scenario and tree
The catalog SHALL support creating, renaming, moving, ordering, and deleting project folders using the backend folder APIs.

#### Scenario: Create a child folder
- **WHEN** a user creates a folder under a selected folder
- **THEN** the client SHALL submit the selected project ID and parent folder UUID
- **AND** refresh the project folder tree after success

#### Scenario: Delete a folder
- **WHEN** a user requests folder deletion
- **THEN** the client SHALL require a choice to move direct scenarios to the parent or to Unfiled
- **AND** explain that child folders are promoted to the deleted folder's parent
- **AND** send the required `disposition=parent|unfiled`
- **AND** refresh affected organization data after success

#### Scenario: Folder operation fails
- **WHEN** the backend rejects a folder change, including duplicate sibling names, invalid depth, or an invalid move
- **THEN** the client SHALL preserve the folder tree and show actionable error feedback

### Requirement: Suites are manual, mutable scenario selections
The catalog SHALL let users manage project suites and their ordered scenario membership without changing scenario records.

#### Scenario: Create or edit a suite
- **WHEN** a user creates or edits a suite
- **THEN** the client SHALL send its name and optional description, purpose, and release values to the selected project's suite API

#### Scenario: Add or remove suite members
- **WHEN** a user adds or removes scenarios from a suite
- **THEN** the client SHALL submit the selected project ID and scenario UUIDs in a bounded batch of at most 100
- **AND** refresh the suite and affected scenario lists after success

#### Scenario: Order suite members
- **WHEN** a user changes suite order
- **THEN** the client SHALL submit the complete ordered list of current scenario UUIDs

#### Scenario: Delete a suite
- **WHEN** a user deletes a suite
- **THEN** the client SHALL remove only the suite and its membership links
- **AND** SHALL preserve all scenarios

#### Scenario: Release suite is viewed
- **WHEN** a suite is named or labeled for a release
- **THEN** the client SHALL present it as a current mutable selection
- **AND** SHALL NOT imply it captures historical run or release evidence

### Requirement: Bulk folder assignment is explicit and bounded
The catalog SHALL support moving selected scenarios to a folder or Unfiled through the backend bulk-folder operation.

#### Scenario: Move selected scenarios
- **WHEN** a user confirms moving selected scenarios
- **THEN** the client SHALL send one request with project ID, unique scenario UUIDs, and the target folder UUID or null
- **AND** SHALL keep the selection limited to at most 100 scenarios
- **AND** refresh the affected lists only after success

#### Scenario: Bulk move is rejected
- **WHEN** any selected scenario or target folder is invalid for the project
- **THEN** the client SHALL retain the current view and selection and show an error

### Requirement: Scenario organization never rewrites execution history
Folder and suite changes SHALL affect only current catalog organization and SHALL preserve scenario identity and historical execution records.

#### Scenario: Scenario is moved or suite membership changes
- **WHEN** a scenario is moved, added to or removed from a suite, or its folder or suite is deleted
- **THEN** the client SHALL keep the scenario's UUID unchanged
- **AND** SHALL NOT alter or relabel historical run results
