## ADDED Requirements

### Requirement: Reassign a Manual Test Run Executor

The client SHALL allow any authenticated active user to assign an active user as Executor of a Manual Test Run in any status. It SHALL load assignment targets from `GET /api/v2/users` and save changes through `PATCH /api/v2/manual-test-runs/{runId}/executor?projectId={projectId}` with a body containing only `executedById`. The server SHALL validate target status at write time and return authoritative run detail. Reassignment SHALL change only the Executor identity and the run's normal `updatedAt` timestamp. It SHALL NOT change run status, run notes, step outcomes or notes, completion timestamps, step timestamps, or saved scenario snapshot fields. Completed runs SHALL remain read-only for all execution data.

#### Scenario: Active user directory loads

- **WHEN** an authenticated active user opens the Executor selector
- **THEN** the client SHALL request `GET /api/v2/users`
- **AND** it SHALL offer only returned active users, displaying name and email for identification
- **AND** it SHALL not require administrator privileges

#### Scenario: Executor editor stays collapsed until requested

- **WHEN** a user views Manual Test Run detail without editing the Executor
- **THEN** the client SHALL show the saved Executor and a Change Executor action
- **AND** it SHALL keep the assignment selector and save controls hidden
- **WHEN** the user activates Change Executor
- **THEN** the client SHALL open the editor and request the active-user directory

#### Scenario: Executor edit is cancelled

- **WHEN** a user changes the selection and activates Cancel
- **THEN** the client SHALL close the editor and restore the saved Executor selection

#### Scenario: Executor reassignment succeeds or fails

- **WHEN** the reassignment succeeds
- **THEN** the client SHALL close the editor and show the authoritative Executor with a compact confirmation
- **WHEN** the reassignment fails
- **THEN** the client SHALL keep the editor open with the selection and actionable error

#### Scenario: User selects an active Executor

- **WHEN** an authenticated active user selects an active user and confirms the assignment
- **THEN** the client SHALL submit only the selected `executedById` to the project-scoped executor endpoint
- **AND** it SHALL display the Executor from the authoritative returned run detail
- **AND** it SHALL refresh matching run detail and affected Manual Test Run history data

#### Scenario: Target becomes inactive before save

- **WHEN** a selected account is pending, suspended, missing, or becomes inactive before the backend processes the assignment
- **THEN** the server SHALL reject the assignment without changing the run
- **AND** the client SHALL retain the selection for correction and display actionable feedback

#### Scenario: In-progress run is reassigned

- **WHEN** reassignment succeeds for an in-progress run
- **THEN** the client SHALL use the returned Executor identity to allow the newly assigned user to continue execution
- **AND** the previous Executor SHALL see the run as view-only in the client
- **AND** this client-side behavior SHALL NOT imply that the backend enforces Executor-only authorization for execution writes

#### Scenario: Completed run Executor changes

- **WHEN** reassignment succeeds for a completed run
- **THEN** the client SHALL display the new Executor
- **AND** status, outcomes, notes, timestamps, and snapshot fields SHALL remain unchanged and read-only

#### Scenario: Directory or reassignment request fails

- **WHEN** the directory or reassignment request fails
- **THEN** the client SHALL show an actionable error or empty state, SHALL NOT claim success, and SHALL NOT submit an unresolved or stale target
- **AND** a failed reassignment SHALL preserve the user's selection for correction

#### Scenario: Authentication or project scope is rejected

- **WHEN** the backend rejects a caller as unauthenticated/inactive or returns not-found for a run outside the supplied `projectId`
- **THEN** the client SHALL show the corresponding actionable state, SHALL NOT apply stale data, and SHALL NOT change the displayed Executor as if the request succeeded

#### Scenario: Project or run changes during reassignment

- **WHEN** the selected project or run changes while reassignment is pending
- **THEN** the client SHALL ignore the late response for presentation and notifications in the new scope
- **AND** it SHALL clear prior-scope drafts according to the existing project/run boundary behavior
