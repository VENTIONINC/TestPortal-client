# Test Scenario Authoring

## Purpose

Enable authenticated users to create and maintain project-scoped Test Scenarios through structured fields and ordered steps without exposing generated Markdown previews or raw source.

## Requirements

### Requirement: Protected scenario entry points

The system SHALL provide separate project-guarded routes for creating a Test Scenario at `/test-scenarios/new`, viewing read-only details at `/test-scenarios/:scenarioId`, and editing at `/test-scenarios/:scenarioId/edit`.

#### Scenario: User starts scenario creation from the catalog

- **WHEN** an authenticated user with a selected project activates the create-scenario action
- **THEN** the system SHALL navigate to `/test-scenarios/new`
- **AND** the system SHALL display an empty Test Scenario authoring form for that project

#### Scenario: User opens an existing scenario by its title

- **WHEN** an authenticated user activates an existing scenario title in the catalog
- **THEN** the system SHALL navigate to `/test-scenarios/:scenarioId`
- **AND** the system SHALL load that scenario's read-only details in the selected project context
- **AND** the system SHALL NOT display editable fields or save controls

#### Scenario: User edits an existing scenario from the catalog menu

- **WHEN** an authenticated user selects **Edit Scenario** from a scenario row's actions menu
- **THEN** the system SHALL navigate to `/test-scenarios/:scenarioId/edit`
- **AND** the system SHALL load that scenario's editable form in the selected project context

#### Scenario: Scenario route lacks required access context

- **WHEN** an unauthenticated user or a user without an available selected project opens a create, details, or edit route
- **THEN** the system SHALL apply the existing authentication and project-guard behavior

### Requirement: Project-scoped scenario creation

The system SHALL create a Test Scenario from a nonblank `title`, optional structured text fields (`details`, `objective`, `preconditions`, `testData`, `expectedResult`, and `notes`), and optional initial steps together with the currently selected `projectId`. Generated Markdown, hash/version metadata, and immutable metadata SHALL NOT be submitted.

#### Scenario: Valid scenario is created

- **WHEN** a user submits a nonblank title and valid structured fields
- **THEN** the system SHALL create the scenario for the selected project
- **AND** the system SHALL navigate to the created scenario's detail route using the returned identifier
- **AND** the read-only details page SHALL reflect the persisted structured response and ordered steps
- **AND** blank optional fields SHALL be omitted from the create request

#### Scenario: Creation is pending

- **WHEN** a create request is in progress
- **THEN** the system SHALL show an explicit pending state
- **AND** the system SHALL prevent repeated create submissions

#### Scenario: Creation fails

- **WHEN** the create request fails
- **THEN** the system SHALL retain all structured field and initial-step drafts for correction or retry
- **AND** the system SHALL display clear API error feedback

### Requirement: Scenario table actions

The Test Scenario catalog SHALL display a final actions column with no visible column title, containing the application's standard three-dots context-menu button for each scenario row.

#### Scenario: Scenario actions are displayed

- **WHEN** the catalog displays a scenario row
- **THEN** the final cell SHALL contain a context-menu button with an accessible name identifying that scenario
- **AND** the final column header SHALL have no visible title
- **AND** the scenario title SHALL link to that scenario's detail route

#### Scenario: User opens the scenario context menu

- **WHEN** the user activates a scenario row's three-dots button
- **THEN** the system SHALL open the shared application context menu at that trigger
- **AND** the menu SHALL contain **Edit Scenario** with an edit icon
- **AND** the menu SHALL contain **Delete Scenario** with a delete icon

#### Scenario: User selects Edit Scenario

- **WHEN** the user selects **Edit Scenario** from the context menu
- **THEN** the context menu SHALL close
- **AND** the system SHALL navigate to `/test-scenarios/:scenarioId/edit` for that row
- **AND** the system SHALL NOT use the read-only title-link destination

#### Scenario: User selects Delete Scenario

- **WHEN** the user selects **Delete Scenario** from the context menu
- **THEN** the context menu SHALL close
- **AND** the system SHALL open delete confirmation for that row without navigating away from the catalog

### Requirement: Project-isolated scenario retrieval

The system SHALL retrieve a scenario for both details and edit pages using the route `scenarioId` and currently selected `projectId` and SHALL never display data belonging to another project context.

#### Scenario: Read-only scenario details are available

- **WHEN** the requested scenario belongs to the selected project
- **AND** the user opened `/test-scenarios/:scenarioId`
- **THEN** the system SHALL display its persisted title, structured fields, ordered steps without Markdown previews or raw source
- **AND** the page SHALL remain read-only

#### Scenario: Editable scenario is available

- **WHEN** the requested scenario belongs to the selected project
- **AND** the user opened `/test-scenarios/:scenarioId/edit`
- **THEN** the system SHALL initialize editable structured fields and steps from the full persisted response
- **AND** summary items SHALL NOT be treated as full scenario bodies

#### Scenario: Scenario is unavailable in the selected project

- **WHEN** the detail request reports that the scenario does not exist in the selected project context
- **THEN** the system SHALL display an unavailable-scenario state
- **AND** the system SHALL provide an action to return to the Test Scenario catalog
- **AND** the system SHALL NOT reveal data previously loaded for that scenario under another project

#### Scenario: Selected project changes during scenario viewing or editing

- **WHEN** the user selects another project while a scenario details or edit route is open
- **THEN** the system SHALL clear the previous detail or form state immediately
- **AND** the system SHALL request the route scenario for the newly selected project
- **AND** the system SHALL show only loading, unavailable, error, or data belonging to the new project context

### Requirement: Details page scenario actions

The read-only scenario details page SHALL provide edit and delete actions inside the application's standard three-dots context menu without making the displayed scenario fields directly editable.

#### Scenario: User opens actions from the details page

- **WHEN** the user activates the scenario-labelled three-dots button on `/test-scenarios/:scenarioId`
- **THEN** the system SHALL open the shared application context menu at that trigger
- **AND** the menu SHALL contain **Edit Scenario** with an edit icon
- **AND** the menu SHALL contain **Delete Scenario** with a delete icon

#### Scenario: User edits from the details page

- **WHEN** the user selects **Edit Scenario** from the details-page context menu
- **THEN** the context menu SHALL close
- **AND** the system SHALL navigate to `/test-scenarios/:scenarioId/edit` for the displayed scenario

#### Scenario: User deletes from the details page

- **WHEN** the user selects **Delete Scenario** from the details-page context menu
- **THEN** the context menu SHALL close
- **AND** the system SHALL open the same exact-title delete confirmation used by the catalog action
- **AND** the details page SHALL remain visible behind the dialog until deletion succeeds

#### Scenario: Details page actions preserve read-only presentation

- **WHEN** the details page displays its context-menu trigger
- **THEN** the persisted title, structured fields and steps SHALL remain non-editable
- **AND** the page SHALL NOT display save controls
- **AND** the page SHALL NOT display standalone Edit or Delete buttons

### Requirement: Structured scenario presentation

The system SHALL present Test Scenarios through structured fields and ordered steps. Generated contentMd and hash/version SHALL remain integration data and SHALL NOT be displayed as a Markdown preview, raw source, or a separate Markdown page, edited, parsed into fields, generated or submitted by the client.

#### Scenario: User views scenario details
- **WHEN** the details page loads or saved data refreshes
- **THEN** the system SHALL display persisted structured fields and ordered steps without Markdown preview or source controls

#### Scenario: User edits a scenario
- **WHEN** the edit page loads, drafts change, or a field or step mutation succeeds
- **THEN** the system SHALL display structured editing controls without a saved Markdown preview or raw source view

### Requirement: Partial structured scenario updates

The system SHALL explicitly save structured scenario field edits only from `/test-scenarios/:scenarioId/edit`, using a project-scoped PATCH containing only changed editable fields. Steps, generated Markdown/hash/version and immutable metadata SHALL be excluded. Omission SHALL preserve stored values and `null` SHALL clear optional text.

#### Scenario: Only title changes

- **WHEN** the user changes only the title and saves
- **THEN** the PATCH request SHALL contain `title`
- **AND** the request SHALL omit generated Markdown

#### Scenario: Both fields change

- **WHEN** the user changes several structured fields and saves
- **THEN** the PATCH request SHALL contain all and only changed normalized fields
- **AND** the system SHALL reset its comparison baseline to the persisted response after success

#### Scenario: No field changed

- **WHEN** normalized current field values equal the last persisted response
- **THEN** the system SHALL NOT submit an update request

#### Scenario: Update fails

- **WHEN** a PATCH request fails
- **THEN** the system SHALL preserve the user's unsaved values
- **AND** the system SHALL display clear API error feedback without repeatedly submitting the request

### Requirement: Structured authoring validation

The system SHALL reject blank titles and step actions, provide field validation feedback, and preserve interior line breaks in optional multiline structured text. Outer whitespace SHALL be normalized consistently with the backend. Explicit saves SHALL remain required without autosave.

#### Scenario: Title contains only whitespace

- **WHEN** the user submits a title containing no non-whitespace characters
- **THEN** the system SHALL display a title validation message
- **AND** the system SHALL NOT submit the mutation

#### Scenario: Optional structured text is empty

- **WHEN** optional structured text contains only whitespace
- **THEN** creation SHALL omit it and editing SHALL clear a previously stored value with `null`

#### Scenario: Multiline structured text is entered

- **WHEN** a structured body field contains interior line breaks
- **THEN** normalization SHALL preserve those line breaks

#### Scenario: Backend normalizes a title

- **WHEN** a successful mutation response contains a normalized title
- **THEN** the system SHALL display and use the persisted response title as the new form baseline

### Requirement: Draft-safe saved response refresh

The system SHALL preserve unrelated unsaved structured field and step drafts when successful mutations return complete scenarios, update saved structured data from persisted responses, and refresh affected project-scoped summary data without fetching full bodies per catalog row.

#### Scenario: Step response changes generated Markdown

- **WHEN** a step response updates saved Markdown while scenario fields are dirty
- **THEN** those field drafts SHALL remain unchanged and SHALL NOT be submitted with the step operation

#### Scenario: Summary metadata changes

- **WHEN** a successful write changes title, details or `updatedAt`
- **THEN** subsequent catalog rendering SHALL reflect persisted summary metadata
- **AND** creator display, null-details fallback, pagination and exact-title deletion SHALL remain available
- **AND** catalog rows SHALL NOT require `contentMd`, steps or per-row detail requests

### Requirement: Scenario deletion

The system SHALL require confirmation before deleting a scenario, SHALL identify the scenario by its persisted title, and SHALL require the user to enter that exact title before deletion is enabled.

#### Scenario: Delete confirmation opens from the row menu

- **WHEN** the user selects **Delete Scenario** for a catalog row
- **THEN** the system SHALL open an alert dialog identifying the scenario by its persisted title
- **AND** the dialog SHALL explain that the exact scenario title must be entered
- **AND** the destructive confirmation action SHALL initially be disabled

#### Scenario: Confirmation title does not match

- **WHEN** the confirmation input does not match the persisted scenario title exactly, including case and whitespace
- **THEN** the destructive confirmation action SHALL remain disabled
- **AND** the system SHALL NOT send a delete request

#### Scenario: Confirmation title matches

- **WHEN** the confirmation input matches the persisted scenario title exactly, including case and whitespace
- **THEN** the destructive confirmation action SHALL become enabled

#### Scenario: User confirms deletion

- **WHEN** the user confirms deletion after entering the exact persisted scenario title
- **THEN** the system SHALL delete it using both its `scenarioId` and selected `projectId`
- **AND** the system SHALL close the confirmation after success
- **AND** the system SHALL navigate to `/test-scenarios`
- **AND** the deleted scenario SHALL no longer remain in the cached catalog UI

#### Scenario: User cancels deletion

- **WHEN** the user cancels the delete confirmation
- **THEN** the system SHALL close the confirmation without sending a delete request

#### Scenario: Deletion fails

- **WHEN** the delete request fails
- **THEN** the system SHALL keep the user on the catalog or details page from which deletion was opened
- **AND** the system SHALL display clear deletion feedback
- **AND** the system SHALL preserve the matching confirmation input so the user can retry or cancel
