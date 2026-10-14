## Purpose

Enable authenticated users to create and maintain project-scoped Test Scenarios as exact Markdown source while also providing a safe, readable rendered preview.

## ADDED Requirements

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

The system SHALL create a Test Scenario using the entered `title` and exact `contentMd` together with the currently selected `projectId`.

#### Scenario: Valid scenario is created

- **WHEN** a user submits a valid title and non-empty Markdown source
- **THEN** the system SHALL create the scenario for the selected project
- **AND** the system SHALL navigate to the created scenario's detail route using the returned identifier
- **AND** the read-only details page SHALL reflect the persisted response

#### Scenario: Creation is pending

- **WHEN** a create request is in progress
- **THEN** the system SHALL show an explicit pending state
- **AND** the system SHALL prevent repeated create submissions

#### Scenario: Creation fails

- **WHEN** the create request fails
- **THEN** the system SHALL keep the entered title and Markdown available for correction or retry
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
- **THEN** the system SHALL display its persisted title and rendered Markdown
- **AND** the page SHALL remain read-only

#### Scenario: Editable scenario is available

- **WHEN** the requested scenario belongs to the selected project
- **AND** the user opened `/test-scenarios/:scenarioId/edit`
- **THEN** the system SHALL initialize editable title and Markdown fields from the persisted response

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
- **THEN** the persisted title and Markdown SHALL remain non-editable
- **AND** the page SHALL NOT display save controls
- **AND** the page SHALL NOT display standalone Edit or Delete buttons

### Requirement: Exact Markdown source and rendered preview

The scenario edit page SHALL allow users to switch between editable Markdown source and a rendered GitHub-Flavored Markdown preview without modifying the stored source value. The read-only details page SHALL render the persisted Markdown without enabling edit mode.

#### Scenario: User previews edited Markdown

- **WHEN** the user switches from source mode to preview mode
- **THEN** the system SHALL render the current unsaved Markdown value
- **AND** headings, Unicode, code fences, indentation, whitespace, and line breaks SHALL remain unchanged in the source value

#### Scenario: User returns to source mode

- **WHEN** the user switches from preview mode back to source mode
- **THEN** the editor SHALL contain exactly the value that was present before preview rendering

#### Scenario: Preview contains an external link

- **WHEN** rendered Markdown contains an external link
- **THEN** the system SHALL open the link in a new browsing context with safe opener isolation

#### Scenario: User views Markdown on the details page

- **WHEN** the read-only details page loads a scenario
- **THEN** the system SHALL render its persisted Markdown using the shared preview behavior
- **AND** the system SHALL NOT expose a source editor or save action

### Requirement: Partial scenario updates

The system SHALL save scenario edits only from `/test-scenarios/:scenarioId/edit`, using a project-scoped PATCH request containing only fields whose values differ from the last persisted response.

#### Scenario: Only title changes

- **WHEN** the user changes only the title and saves
- **THEN** the PATCH request SHALL contain `title`
- **AND** the request SHALL omit `contentMd`
- **AND** the persisted Markdown source SHALL remain unchanged

#### Scenario: Only Markdown changes

- **WHEN** the user changes only `contentMd` and saves
- **THEN** the PATCH request SHALL contain `contentMd` exactly as entered
- **AND** the request SHALL omit `title`
- **AND** the persisted title SHALL remain unchanged

#### Scenario: Both fields change

- **WHEN** the user changes both title and `contentMd` and saves
- **THEN** the PATCH request SHALL contain both changed fields
- **AND** the system SHALL reset its comparison baseline to the persisted response after success

#### Scenario: No field changed

- **WHEN** the current form values equal the last persisted response
- **THEN** the system SHALL NOT submit an update request

#### Scenario: Update fails

- **WHEN** a PATCH request fails
- **THEN** the system SHALL preserve the user's unsaved values
- **AND** the system SHALL display clear API error feedback without repeatedly submitting the request

### Requirement: Authoring validation

The system SHALL reject a blank title and an empty Markdown string before submitting a create or update request while preserving non-empty Markdown exactly.

#### Scenario: Title contains only whitespace

- **WHEN** the user submits a title containing no non-whitespace characters
- **THEN** the system SHALL display a title validation message
- **AND** the system SHALL NOT submit the mutation

#### Scenario: Markdown is empty

- **WHEN** the user submits `contentMd` with a length of zero
- **THEN** the system SHALL display a Markdown validation message
- **AND** the system SHALL NOT submit the mutation

#### Scenario: Markdown contains only whitespace

- **WHEN** the user submits non-empty `contentMd` consisting of whitespace or line breaks
- **THEN** the system SHALL preserve and submit that exact value

#### Scenario: Backend normalizes a title

- **WHEN** a successful mutation response contains a normalized title
- **THEN** the system SHALL display and use the persisted response title as the new form baseline

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
