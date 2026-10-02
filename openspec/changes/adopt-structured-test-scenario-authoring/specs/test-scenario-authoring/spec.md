## MODIFIED Requirements

### Requirement: Project-scoped scenario creation

The system SHALL create a Test Scenario from title, optional details/objective/preconditions/testData/expectedResult/notes, and optional initial steps together with the selected projectId. Generated Markdown/hash/version and immutable metadata SHALL NOT be submitted.

#### Scenario: Valid scenario is created
- **WHEN** a user submits a nonblank title and valid structured fields
- **THEN** the system SHALL create the scenario for the selected project and navigate using the returned identifier
- **AND** details SHALL reflect the persisted response
- **AND** blank optional fields SHALL be omitted from the create request

#### Scenario: Creation is pending
- **WHEN** a create request is in progress
- **THEN** the system SHALL show an explicit pending state and prevent repeated submissions

#### Scenario: Creation fails
- **WHEN** the create request fails
- **THEN** the system SHALL retain all field and step drafts and display clear API feedback

#### Scenario: Project changes before creation completes
- **WHEN** a create response arrives after the selected project changes
- **THEN** it SHALL NOT navigate or display prior-project content in the new project context

### Requirement: Project-isolated scenario retrieval

The system SHALL retrieve full detail for both details and edit pages using scenarioId and selected projectId and SHALL never display data belonging to another project context.

#### Scenario: Read-only scenario details are available
- **WHEN** the requested scenario belongs to the selected project on the detail route
- **THEN** the system SHALL display persisted title, details, structured body fields, ordered steps in read-only form without generated Markdown

#### Scenario: Editable scenario is available
- **WHEN** the requested scenario belongs to the selected project on the edit route
- **THEN** the system SHALL initialize editable structured fields and steps from full detail
- **AND** summary items SHALL NOT be treated as full scenario bodies

#### Scenario: Scenario is unavailable in the selected project
- **WHEN** the detail request reports that the scenario does not exist in the selected project
- **THEN** the system SHALL display the unavailable state and a return-to-catalog action without revealing previous-project data

#### Scenario: Selected project changes during scenario viewing or editing
- **WHEN** the selected project changes
- **THEN** the system SHALL immediately clear previous details and drafts and request the route scenario under the new project
- **AND** only loading, unavailable, error or current-project data SHALL appear
- **AND** late old-scope mutations SHALL NOT alter the new scope's UI

## REMOVED Requirements

### Requirement: Exact Markdown source and rendered preview

**Reason**: Structured data is authoritative and the backend owns Markdown generation.
**Migration**: Replace Markdown source and previews with structured scenario presentation defined below.

### Requirement: Partial scenario updates

**Reason**: The old contract permits authored Markdown writes and requires title changes to preserve Markdown, conflicting with backend generation.
**Migration**: Use Partial structured scenario updates, preserving explicit save, changed-field omission, failure retention and no-op handling.

### Requirement: Authoring validation

**Reason**: Required authored Markdown and acceptance of whitespace-only Markdown no longer apply to structured inputs.
**Migration**: Use Structured authoring validation for titles, actions and optional multiline values.

## ADDED Requirements

### Requirement: Partial structured scenario updates

The system SHALL explicitly save scenario field edits from the edit route using a project-scoped PATCH containing only changed editable fields. Steps, generated Markdown/hash/version and immutable metadata SHALL be excluded. Omission SHALL preserve stored values and null SHALL clear optional text.

#### Scenario: Only title changes
- **WHEN** only title changes and the user saves
- **THEN** PATCH SHALL contain only title and the saved baseline SHALL adopt the persisted title

#### Scenario: Optional fields change or are cleared
- **WHEN** the user changes or clears optional fields and saves
- **THEN** PATCH SHALL contain only normalized changed values with null for explicitly cleared persisted text
- **AND** details SHALL remain separate from the body fields

#### Scenario: Multiple fields change
- **WHEN** several scenario fields change and the user saves
- **THEN** PATCH SHALL contain all and only changed scenario fields
- **AND** successful returned values SHALL establish the new saved baseline

#### Scenario: No field changed
- **WHEN** normalized values equal the saved values, including blank input for an already null field
- **THEN** the system SHALL NOT submit an empty update

#### Scenario: Update fails
- **WHEN** PATCH fails
- **THEN** the system SHALL preserve unsaved values and display clear API feedback without repeated submission

### Requirement: Structured authoring validation

The system SHALL reject blank titles and step actions, provide field validation feedback and preserve interior line breaks in optional multiline body text. Outer whitespace SHALL be normalized consistently with the backend. Explicit saves SHALL remain required without autosave.

#### Scenario: Title contains only whitespace
- **WHEN** a user submits a whitespace-only title
- **THEN** the system SHALL display a title error and send no mutation

#### Scenario: Optional text is empty
- **WHEN** optional text contains only whitespace
- **THEN** creation SHALL omit it and editing SHALL clear a previously stored value with null

#### Scenario: Multiline text is entered
- **WHEN** a body field contains interior line breaks
- **THEN** normalization SHALL preserve those line breaks

#### Scenario: Backend normalizes a title
- **WHEN** a successful response contains a normalized title
- **THEN** the system SHALL use that persisted title for display and the saved baseline


### Requirement: Structured scenario presentation

The system SHALL present Test Scenarios through structured fields and ordered steps. Generated contentMd and hash/version SHALL remain integration data and SHALL NOT be displayed as a Markdown preview, raw source, or a separate Markdown page, edited, parsed into fields, generated or submitted by the client.

#### Scenario: User views scenario details
- **WHEN** the details page loads or saved data refreshes
- **THEN** the system SHALL display persisted structured fields and ordered steps without Markdown preview or source controls

#### Scenario: User edits a scenario
- **WHEN** the edit page loads, drafts change, or a field or step mutation succeeds
- **THEN** the system SHALL display structured editing controls without a saved Markdown preview or raw source view

### Requirement: Draft-safe saved response refresh

The system SHALL preserve unrelated unsaved drafts across successful mutations and refresh detail and affected summary data within their project scope.

#### Scenario: Step response changes generated Markdown
- **WHEN** a step response updates saved Markdown while scenario fields are dirty
- **THEN** those field drafts SHALL remain unchanged and SHALL NOT be submitted with the step operation

#### Scenario: Summary metadata changes
- **WHEN** a successful write changes title, details or updatedAt
- **THEN** subsequent catalog rendering SHALL reflect persisted summary metadata
- **AND** creator display, null-details fallback, pagination and exact-title deletion SHALL remain available
- **AND** catalog rows SHALL NOT require contentMd, steps or per-row detail requests
