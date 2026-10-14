## Purpose

Enable users to author ordered scenario steps and maintain individual persisted steps without losing unrelated scenario drafts.

## ADDED Requirements

### Requirement: Initial scenario steps

The system SHALL support zero or more ordered initial steps with required nonblank action and optional expectedResult, submitted atomically with scenario creation without IDs or positions.

#### Scenario: Create with steps
- **WHEN** the user adds, edits, removes or reorders initial step drafts and creates a scenario
- **THEN** the request SHALL contain the final ordered action/expectedResult entries without temporary IDs or positions
- **AND** blank optional expected results SHALL be omitted

#### Scenario: Create without steps
- **WHEN** the user creates a scenario with no steps
- **THEN** creation SHALL remain available and the saved scenario SHALL display a clear empty-step state

### Requirement: Independent persisted step operations

The system SHALL use POST steps, PATCH steps/{stepId}, DELETE steps/{stepId}, and PUT steps/order under `/api/v2/test-scenarios/{scenarioId}`, each with selected projectId query context. Persisted rows SHALL use stable backend IDs and human-readable numbering. Operations SHALL never submit unrelated scenario fields.

#### Scenario: Append a step
- **WHEN** the user submits a nonblank action and optional expected result
- **THEN** POST SHALL send only those fields and adopt the complete scenario returned with status 201

#### Scenario: Edit or clear a step value
- **WHEN** the user saves changes to a persisted step
- **THEN** PATCH SHALL contain only changed action and/or expectedResult, with null clearing a stored expected result
- **AND** an unchanged save SHALL send no request
- **AND** blank actions SHALL be rejected with field feedback

#### Scenario: Delete a step
- **WHEN** the user deletes a persisted step
- **THEN** DELETE SHALL send no body and display the returned steps and numbering after success

#### Scenario: Move a persisted step
- **WHEN** the user activates an accessible Move up or Move down control
- **THEN** PUT SHALL send every current backend step ID once in the desired order
- **AND** the UI SHALL adopt the successful response order without modifying actions or expected results

### Requirement: Step mutation feedback and draft preservation

The system SHALL provide per-operation pending/error feedback, prevent duplicate submissions and preserve unrelated drafts when applying complete scenario responses. Saved changes SHALL refresh persisted structured data and relevant summary metadata.

#### Scenario: Step write completes while fields are dirty
- **WHEN** a step write succeeds while unrelated scenario fields or other steps contain unsaved drafts
- **THEN** saved steps SHALL reflect the response
- **AND** unrelated drafts SHALL remain available without being submitted

#### Scenario: Step write fails
- **WHEN** an append, edit, delete or reorder request fails
- **THEN** the UI SHALL show actionable operation feedback without claiming a persisted change
- **AND** editable drafts SHALL remain available for correction or retry

#### Scenario: Mutation is pending
- **WHEN** a step operation is in progress
- **THEN** the UI SHALL identify that pending operation and prevent duplicate or overlapping writes for the scenario

### Requirement: Stale ordering recovery

The system SHALL recover from stale reorder membership rejection by fetching current steps and requiring user retry rather than automatically replaying the old order.

#### Scenario: Backend rejects stale membership
- **WHEN** reorder returns HTTP 400 because the ID list no longer matches current membership
- **THEN** the UI SHALL report rejection and refetch current detail
- **AND** unrelated field drafts SHALL survive
- **AND** a retry SHALL use the refreshed steps only after explicit user action

#### Scenario: Refresh fails
- **WHEN** the current-step refresh fails after reorder rejection
- **THEN** the UI SHALL show retry feedback and SHALL NOT report successful ordering
