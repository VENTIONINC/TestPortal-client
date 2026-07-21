# custom-skill-management Specification

## Purpose

Define authenticated creation, replacement, and deletion of shared custom skills while protecting read-only skills and keeping Skills Hub data consistent.

## Requirements

### Requirement: Authenticated Custom Skill Creation

The system SHALL allow an authenticated user to create a shared custom skill from one ZIP package, a non-empty catalog title, and a non-empty catalog category.

#### Scenario: User opens the create workflow

- **WHEN** an authenticated user activates the create-skill action from the Skills Hub catalog
- **THEN** the system displays a create form with ZIP package, title, and category inputs

#### Scenario: Required create fields are missing

- **WHEN** the user attempts to create a skill without one ZIP package or with a blank title or category
- **THEN** the system prevents submission and identifies each invalid required field

#### Scenario: Create request is submitted

- **WHEN** the user submits valid create inputs
- **THEN** the system sends `package`, trimmed `title`, and trimmed `category` as authenticated `multipart/form-data`

#### Scenario: Custom skill is created

- **WHEN** the backend creates the custom skill successfully
- **THEN** the system closes the form, communicates success, refreshes the Skills catalog, and displays the created skill in the catalog

#### Scenario: Create request fails

- **WHEN** the backend rejects the create request because of package validation, a duplicate name conflict, authentication, or an unexpected error
- **THEN** the system displays useful error feedback without clearing or closing the current form

#### Scenario: Create request is pending

- **WHEN** a create request is in progress
- **THEN** the system displays a loading state and prevents duplicate submissions

### Requirement: Stable-ID Custom Skill Replacement

The system SHALL allow a writable custom skill to be fully replaced through its persisted ID while retaining the same detail route.

#### Scenario: User opens the replace workflow

- **WHEN** the loaded skill has `source` equal to `custom` and `readOnly` equal to `false` and the user activates the replace action
- **THEN** the system displays a replacement form with the current title and category pre-populated and requires a new ZIP package

#### Scenario: Replacement request is submitted

- **WHEN** the user submits a valid replacement package, title, and category
- **THEN** the system sends authenticated `multipart/form-data` to the selected skill's persisted-ID replacement endpoint

#### Scenario: Replacement succeeds

- **WHEN** the backend replaces the custom skill successfully
- **THEN** the system closes the form, communicates success, remains on the same `/skills/{id}` route, and refreshes catalog metadata and current detail data

#### Scenario: Replacement changes package frontmatter

- **WHEN** a successful replacement changes the skill name, description, optional metadata, Markdown content, or bundled resources
- **THEN** the same persisted-ID route displays the replacement metadata and preview and subsequent ZIP downloads reflect the replacement package

#### Scenario: Replacement request fails

- **WHEN** replacement returns validation, forbidden, not-found, duplicate-name conflict, authentication, or unexpected failure
- **THEN** the system displays useful error feedback without leaving the detail page or clearing or closing the replacement form

#### Scenario: Replacement request is pending

- **WHEN** a replacement request is in progress
- **THEN** the system displays a loading state and prevents duplicate submissions

### Requirement: Confirmed Custom Skill Deletion

The system SHALL delete a writable custom skill only after explicit user confirmation.

#### Scenario: User requests deletion

- **WHEN** the loaded skill has `source` equal to `custom` and `readOnly` equal to `false` and the user activates the delete action
- **THEN** the system displays an alert dialog identifying the skill and explaining that deletion is permanent

#### Scenario: User cancels deletion

- **WHEN** the user cancels or closes the deletion confirmation before confirming
- **THEN** the system does not issue a delete request and leaves the detail page unchanged

#### Scenario: User confirms deletion

- **WHEN** the user confirms deletion
- **THEN** the system sends an authenticated delete request using the selected skill's persisted ID and prevents duplicate confirmations while it is pending

#### Scenario: Deletion succeeds

- **WHEN** the backend deletes the custom skill successfully
- **THEN** the system communicates success, refreshes Skills data, navigates to `/skills`, and no longer displays the deleted skill in the catalog

#### Scenario: Deletion fails

- **WHEN** deletion returns forbidden, not-found, authentication, or unexpected failure
- **THEN** the system displays useful error feedback and preserves the current detail page and confirmation context

### Requirement: Read-Only Skill Mutation Protection

The system SHALL not expose active replacement or deletion controls for skills that are system-sourced or read-only.

#### Scenario: User views a system skill

- **WHEN** the loaded skill has `source` equal to `system` or `readOnly` equal to `true`
- **THEN** the system omits active replace and delete controls while preserving preview and ZIP download behavior

#### Scenario: Backend rejects a stale mutation

- **WHEN** cached metadata indicated a skill was writable but the backend returns forbidden for a mutation
- **THEN** the system presents the forbidden response without treating the mutation as successful or losing the current page state

### Requirement: Custom Skill Mutation Cache Consistency

The system SHALL synchronize the Skills catalog and detail queries after successful custom skill mutations.

#### Scenario: Mutation affects catalog data

- **WHEN** create, replacement, or deletion succeeds
- **THEN** the system invalidates or refreshes cached Skills catalog data so titles, categories, names, and membership are current

#### Scenario: Replacement affects detail data

- **WHEN** replacement succeeds for the skill displayed on the current stable-ID route
- **THEN** the system refreshes that skill's metadata and Markdown detail rather than continuing to display stale content

#### Scenario: Mutation fails

- **WHEN** create, replacement, or deletion fails
- **THEN** the system does not present stale optimistic data as a successful persisted mutation
