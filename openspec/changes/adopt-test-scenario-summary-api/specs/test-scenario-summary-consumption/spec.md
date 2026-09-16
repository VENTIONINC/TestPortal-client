## Purpose

Allow users to identify Test Scenarios from lightweight metadata while retrieving full Markdown only for scenario details and editing within the selected project.

## ADDED Requirements

### Requirement: Lightweight scenario list consumption

The client SHALL consume list items containing `id`, `projectId`, `createdById`, `title`, nullable `details`, `createdBy` with `id`, `name`, and `email`, `createdAt`, and `updatedAt`. Catalog consumers SHALL NOT require or read `contentMd` from list items or fetch full scenarios to populate catalog rows.

#### Scenario: List response contains summaries only

- **WHEN** the selected project's list response contains summary items without `contentMd`
- **THEN** the catalog SHALL render the returned scenarios successfully
- **AND** populating the catalog SHALL NOT trigger individual scenario detail requests

### Requirement: Scenario details and creator presentation

The catalog SHALL display columns in the order Title, Details, Created by, Created, Updated, and the existing final actions column with no visible header title. It SHALL render details as plain text, show `No details` for null details, and display each summary's creator name with secondary email from that same summary's `createdBy` object. The client SHALL retain `createdById` and SHALL NOT substitute the signed-in user's identity for the returned creator.

#### Scenario: Scenario has details and creator metadata

- **WHEN** a summary includes non-null details and creator metadata
- **THEN** its row SHALL display those details, creator name and email, title, and creation and update timestamps
- **AND** the creator SHALL remain associated with that row's `createdById`
- **AND** the existing title link and scenario actions SHALL continue to target that scenario

#### Scenario: Details are null

- **WHEN** a summary has `details: null`
- **THEN** its Details cell SHALL show `No details` without an error

#### Scenario: Details contain markup characters

- **WHEN** details contain Markdown or HTML syntax
- **THEN** the catalog SHALL display the syntax as text without rendering Markdown or HTML

#### Scenario: Rows have different creators

- **WHEN** two summaries have different `createdById` values and corresponding creator objects
- **THEN** each row SHALL display its own returned creator name and email even when neither creator is the signed-in user

### Requirement: Summary metadata remains project scoped

Summary adoption SHALL preserve the selected-project pagination and request-state behavior, including a page limit of 10, page-one reset on project switch, and isolation of titles, details, and creator metadata between project requests.

#### Scenario: User switches projects from a later page

- **WHEN** the user switches projects while viewing a page later than page 1
- **THEN** the first request for the new project SHALL use page 1 and limit 10
- **AND** the previous project's titles, details, and creators SHALL NOT appear while the new request is pending

#### Scenario: Summary request states and pagination

- **WHEN** a summary request is loading, fails, returns no items, or returns a populated page
- **THEN** the catalog SHALL preserve the corresponding loading, error, empty, or populated state
- **AND** loading table columns SHALL match the populated table
- **AND** pagination controls and the showing summary SHALL use the response pagination metadata

### Requirement: Full Markdown retrieval for details and editing

The client SHALL retrieve the full scenario using its identifier and selected project context before displaying persisted Markdown or initializing editing. Summary metadata SHALL NOT serve as the full scenario payload. Existing title and Markdown authoring semantics SHALL remain unchanged.

#### Scenario: User opens details or edit from a summary row

- **WHEN** the user opens a scenario's detail or edit route after loading a summary-only catalog
- **THEN** the client SHALL request the full scenario with `scenarioId` and selected `projectId`
- **AND** Markdown display or form initialization SHALL use the returned full scenario's `contentMd`

#### Scenario: Existing authored fields are saved

- **WHEN** the user saves a title or Markdown change without changing details
- **THEN** the request SHALL contain only the changed authored fields
- **AND** the request SHALL NOT clear or overwrite details metadata


### Requirement: Optional details during scenario creation

The create form SHALL provide an optional plain-text Details field separate from Markdown source and preview. Submission SHALL trim outer whitespace from details while preserving internal whitespace and existing Markdown semantics. It SHALL include non-empty details in the create request and omit details for empty or whitespace-only input.

#### Scenario: Create with details

- **WHEN** the user creates a scenario with non-empty details
- **THEN** the request SHALL include the trimmed details alongside the selected project, title, and exact Markdown content
- **AND** the refreshed catalog SHALL display the persisted details

#### Scenario: Create without details

- **WHEN** Details is empty or contains only whitespace
- **THEN** creation SHALL remain valid when the other required fields are valid
- **AND** the request SHALL omit details rather than send an empty string or null

### Requirement: Optional details during scenario editing

The edit form SHALL initialize Details from the full scenario response, displaying an empty field for null. It SHALL include only changed fields in PATCH requests after normalizing outer details whitespace. Changed non-empty details SHALL be sent as a string; clearing existing details SHALL send null. Unchanged details SHALL be omitted, and a submission with no changed fields SHALL issue no mutation.

#### Scenario: Edit details alone or alongside other fields

- **WHEN** the user changes details alone or together with title or Markdown
- **THEN** the PATCH request SHALL include the normalized changed details and only the other fields that changed
- **AND** the refreshed catalog SHALL show the persisted details

#### Scenario: Clear existing details

- **WHEN** the persisted scenario has non-null details and the user leaves Details empty or whitespace-only
- **THEN** PATCH SHALL include `details: null`
- **AND** the refreshed catalog SHALL display `No details`

#### Scenario: Details remain unchanged

- **WHEN** normalized details equal the persisted value, including blank input for null details
- **THEN** PATCH SHALL omit details
- **AND** if no other field changed the client SHALL issue no mutation

#### Scenario: Save succeeds or fails

- **WHEN** creation or editing succeeds
- **THEN** subsequent form initialization and edit comparisons SHALL use the persisted response including details
- **WHEN** a save fails
- **THEN** the form SHALL retain entered details, title, and Markdown for retry

#### Scenario: Project context changes during editing

- **WHEN** the selected project changes
- **THEN** the previous project's details SHALL be cleared with the existing form state
- **AND** any newly initialized details SHALL belong to the requested scenario in the selected project
