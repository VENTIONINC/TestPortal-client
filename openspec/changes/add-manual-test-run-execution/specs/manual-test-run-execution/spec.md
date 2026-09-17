## Purpose

Enable testers to execute saved scenarios, persist observations and complete immutable Manual Test Runs while retaining the tested snapshot and selected-project isolation.

## ADDED Requirements

### Requirement: Start a run from a saved scenario

The system SHALL expose Start manual run on saved scenario detail, create a run in the selected project without identity or snapshot overrides, prevent duplicate pending starts and navigate only after confirmed success in the current scope.

#### Scenario: Start succeeds
- **WHEN** the tester starts an available saved scenario
- **THEN** the system SHALL create a run with server identity/timestamps, in_progress status and not_started steps
- **AND** it SHALL open the returned run detail URL without a preliminary notes dialog

#### Scenario: Start result is uncertain
- **WHEN** a start fails without establishing whether the server created a run
- **THEN** the system SHALL explain that a run may have been created and SHALL NOT retry or navigate automatically
- **AND** any later explicit start SHALL warn that another run could be created

### Requirement: Protected snapshot retrieval and resume

The system SHALL provide authenticated, project-guarded `/manual-test-runs/:runId` retrieval and render saved title, details, objective, preconditions, testData, expectedResult, scenarioNotes, ordered copied steps, executor and server timestamps. It SHALL distinguish scenario notes from execution notes and SHALL NOT use the current scenario as the run body.

#### Scenario: Tester reopens an active run
- **WHEN** the tester reopens an existing active run URL
- **THEN** persisted outcomes and notes SHALL be restored without creating another run
- **AND** unsaved local edits from a closed page SHALL NOT be presented as persisted progress

#### Scenario: Source or executor is unavailable
- **WHEN** the source scenario was edited/deleted or executor data is null
- **THEN** saved run content SHALL remain readable and unchanged by source edits
- **AND** deleted-source and unavailable-executor states SHALL have clear fallbacks

#### Scenario: Retrieval is pending or fails
- **WHEN** detail retrieval is pending, fails or returns scoped 404
- **THEN** the system SHALL display loading, actionable error/retry or unavailable states respectively without unrelated cached content

### Requirement: Explicit execution saves

The system SHALL explicitly save run notes and each step's outcome/notes using copied run-step identifiers and selected project context. Step outcomes SHALL be not_started, passed, failed, blocked or skipped. Run note saves SHALL NOT submit status. Payloads SHALL exclude copied content, identity, timestamps and generated Markdown; omission preserves notes, null clears them and blank strings SHALL NOT be submitted.

#### Scenario: Step outcome and notes are saved
- **WHEN** the tester saves a changed step draft
- **THEN** only changed status/notes SHALL be submitted and success SHALL display persisted results
- **AND** unrelated step/run-note drafts SHALL remain intact

#### Scenario: Notes are cleared or unchanged
- **WHEN** the tester clears persisted notes or saves unchanged normalized values
- **THEN** clearing SHALL submit null and unchanged values SHALL cause no mutation
- **AND** normalization SHALL preserve interior line breaks

#### Scenario: Save fails
- **WHEN** an execution save fails
- **THEN** drafts SHALL remain available with actionable feedback and no false persisted-success indication

### Requirement: Writes and completion respect saved state

The system SHALL prevent duplicate or overlapping run writes and SHALL block completion while writes are pending or any execution drafts are unsaved. It SHALL offer explicit draft discard and SHALL NOT silently save or discard drafts during completion.

#### Scenario: Tester attempts completion with drafts
- **WHEN** the tester requests completion with unsaved outcomes or notes
- **THEN** the system SHALL require saving or discarding those changes before completion
- **AND** discard SHALL restore the latest saved values

#### Scenario: A write is pending
- **WHEN** an execution write is pending
- **THEN** other mutation actions and completion SHALL be blocked with pending feedback

### Requirement: Explicit terminal completion

The system SHALL confirm completion with an explicit passed, failed, blocked or skipped outcome and an immutable-result warning, using the dedicated completion operation. It SHALL NOT infer overall outcome from steps or finalize through ordinary run-note saves. Passed eligibility SHALL use persisted steps: zero steps qualify, otherwise every step must be passed/skipped with at least one passed. Other terminal outcomes SHALL permit unresolved steps.

#### Scenario: Tester confirms or cancels completion
- **WHEN** the tester selects an eligible outcome and confirms completion
- **THEN** one completion request SHALL be submitted and successful returned results SHALL become read-only
- **AND** cancelling confirmation SHALL submit nothing

#### Scenario: Passed completion is ineligible
- **WHEN** a nonempty run contains an unresolved/failed/blocked step or all steps are skipped
- **THEN** passed confirmation SHALL be blocked with an explanation
- **AND** failed, blocked and skipped completion SHALL remain available

#### Scenario: Zero-step run completes
- **WHEN** a zero-step run is explicitly completed passed
- **THEN** the system SHALL permit the operation

### Requirement: Authoritative conflict and uncertain-result recovery

The system SHALL refetch authoritative detail on 409 and before repeating an ambiguous completion. It SHALL NOT automatically replay starts/completions after ambiguous errors or rejected writes. Completed records SHALL remain immutable with no reopen action.

#### Scenario: Conflict leaves the run active
- **WHEN** a rejected write returns 409 and refreshed detail remains in_progress
- **THEN** the system SHALL retain dirty drafts, explain the conflict and require explicit corrective action without replay

#### Scenario: Another session completed the run
- **WHEN** refreshed detail shows a completed run after a rejected local write
- **THEN** the system SHALL display authoritative read-only results without claiming the local write succeeded
- **AND** rejected local note text SHALL remain available for review/copy within the current scope

#### Scenario: Authoritative refresh fails
- **WHEN** conflict or uncertain-completion recovery cannot retrieve detail
- **THEN** the system SHALL show retry feedback and prevent further writes until authoritative state is recovered

### Requirement: Selected-project isolation and cache consistency

All operations SHALL carry selected projectId; cached identity SHALL include project and run. Project/run changes SHALL clear prior drafts and prevent late responses from causing content, navigation or notifications in another scope. Confirmed writes SHALL refresh matching detail and relevant project/scenario history data.

#### Scenario: Project changes during a request
- **WHEN** the tester changes project while a start, detail or write request is pending
- **THEN** previous content/drafts SHALL clear immediately and only new-scope results SHALL appear
- **AND** old responses SHALL NOT navigate or show completion/success notifications

#### Scenario: Persisted state changes
- **WHEN** start, execution save or completion succeeds
- **THEN** matching run detail and affected history data SHALL reflect persisted state without requiring a full page reload

### Requirement: Accessible execution controls

The system SHALL provide labelled keyboard-accessible start, outcome, note, save, discard and completion controls and accessible completion-dialog focus behavior.

#### Scenario: Tester uses the keyboard
- **WHEN** the tester performs execution and completion using a keyboard
- **THEN** controls and feedback SHALL be accessible and completion cancellation SHALL restore focus to its trigger
