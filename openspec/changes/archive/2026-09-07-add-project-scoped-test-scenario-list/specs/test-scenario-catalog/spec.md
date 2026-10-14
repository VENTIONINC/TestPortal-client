## Purpose

Provide authenticated users with a project-isolated catalog for discovering Test Scenario summaries without loading or displaying full Markdown scenario content.

## ADDED Requirements

### Requirement: Authenticated Test Scenario catalog entry point

The system SHALL provide a **Test Scenarios** navigation entry that opens the `/test-scenarios` catalog through the existing authentication and selected-project protections.

#### Scenario: Authenticated user opens the catalog from navigation

- **WHEN** an authenticated user with a selected project activates the **Test Scenarios** navigation item
- **THEN** the system SHALL navigate to `/test-scenarios`
- **AND** the system SHALL display the Test Scenario catalog for the selected project

#### Scenario: Unauthenticated user opens the catalog route

- **WHEN** an unauthenticated user attempts to open `/test-scenarios`
- **THEN** the system SHALL apply the existing protected-route authentication behavior

#### Scenario: User opens the catalog without an available project

- **WHEN** an authenticated user without an available selected project attempts to open `/test-scenarios`
- **THEN** the system SHALL apply the existing project-guard behavior

### Requirement: Project-scoped Test Scenario retrieval

The system SHALL request only the paginated Test Scenarios belonging to the currently selected project.

The catalog SHALL request a page limit of 10 scenarios.

#### Scenario: Catalog requests its first page

- **WHEN** the catalog loads for a selected project
- **THEN** the system SHALL request page 1 with a limit of 10 and the selected project's `projectId`

#### Scenario: User selects another page

- **WHEN** the user selects an available catalog page
- **THEN** the system SHALL request that page for the same selected project with a limit of 10

#### Scenario: Backend returns pagination metadata

- **WHEN** a catalog request succeeds
- **THEN** the system SHALL derive available pagination controls from the response `page`, `limit`, `total`, and `totalPages` metadata

### Requirement: Test Scenario summary presentation

The catalog SHALL present returned scenarios in a table with **Title**, **Created**, and **Updated** columns without rendering or depending on Markdown content.

#### Scenario: Catalog contains scenarios

- **WHEN** the selected project's list response contains one or more scenarios
- **THEN** the catalog SHALL display one table row per scenario
- **AND** each row SHALL display the scenario title under **Title**, its creation timestamp under **Created**, and its update timestamp under **Updated**
- **AND** the catalog SHALL NOT display `contentMd`

#### Scenario: List response includes Markdown content

- **WHEN** the backend list response includes `contentMd` on scenario records
- **THEN** the catalog SHALL ignore that field
- **AND** catalog rendering SHALL remain based only on summary fields

#### Scenario: Scenario summary is displayed

- **WHEN** a scenario is shown in this catalog
- **THEN** the catalog SHALL NOT offer detail, creation, editing, deletion, Markdown preview, relationship, or evidence actions

### Requirement: Catalog request states

The catalog SHALL clearly represent loading, error, empty, and populated request states without crashing the page.

#### Scenario: Initial request is loading

- **WHEN** the selected project's initial scenario-list request is pending
- **THEN** the catalog SHALL display a loading state consistent with existing client patterns

#### Scenario: Request fails

- **WHEN** the scenario-list request fails for a non-authentication reason
- **THEN** the catalog SHALL display a useful error state
- **AND** the catalog SHALL NOT display scenario records from another request scope

#### Scenario: Selected project has no scenarios

- **WHEN** the scenario-list request succeeds with an empty `scenarios` array
- **THEN** the catalog SHALL display a clear no-scenarios state
- **AND** the catalog SHALL NOT display pagination controls

#### Scenario: Selected project has multiple pages

- **WHEN** the scenario-list response reports more than one page
- **THEN** the catalog SHALL display pagination controls using the reported current and total page values
- **AND** the pagination controls SHALL appear below the scenario table

### Requirement: Project-switch isolation

The catalog SHALL reset its pagination and visible scenario state when the selected project changes.

#### Scenario: User switches projects from a later page

- **WHEN** the catalog is displaying a page later than page 1 and the user selects another project
- **THEN** the catalog SHALL reset to page 1 for the newly selected project
- **AND** the first request for the newly selected project SHALL use page 1

#### Scenario: New project request is pending

- **WHEN** the selected project changes and its scenario-list request has not completed
- **THEN** the catalog SHALL NOT display scenarios returned for the previously selected project

#### Scenario: User returns to a previously viewed project

- **WHEN** the user returns to a project that has cached scenario-list data
- **THEN** the catalog SHALL still begin at page 1
- **AND** any displayed cached data SHALL belong to that selected project and page
