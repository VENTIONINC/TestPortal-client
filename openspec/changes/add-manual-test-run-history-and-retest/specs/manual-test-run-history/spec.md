## Purpose

Enable testers to discover project-scoped execution history, inspect preserved scenario snapshots, resume active runs and start fresh tests of current saved scenarios.

## ADDED Requirements

### Requirement: Protected history entry points

The system SHALL provide a separate project history page at `/manual-test-runs` in the left navigation labelled Manual Test Runs and a separate scenario history page at `/test-scenarios/:scenarioId/manual-runs` linked from scenario detail. Both SHALL use existing authentication and selected-project protections.

#### Scenario: User opens project history
- **WHEN** an authenticated user with a selected project activates Manual Test Runs in the left navigation
- **THEN** the system SHALL show history for that project

#### Scenario: User opens scenario history
- **WHEN** the user activates history from saved scenario detail
- **THEN** the system SHALL open the separate history page scoped to that scenario and selected project

#### Scenario: Required access context is absent
- **WHEN** history is opened without authentication or an available selected project
- **THEN** the system SHALL apply existing authentication and project-guard behavior

### Requirement: Paginated filtered history

History SHALL use backend pagination with limit 30, combined status and started-date filters, and a source-scenario filter on project history. Supported statuses SHALL be in_progress, passed, failed, blocked and skipped. Scenario history SHALL use its nested endpoint without an additional testScenarioId filter. Requests SHALL carry selected projectId, preserve server ordering, and use server totals and pagination metadata without per-row detail retrieval.

#### Scenario: User combines filters
- **WHEN** the user applies status, source scenario and date filters to project history
- **THEN** the system SHALL request them together from project history and show its returned matching runs and totals
- **AND** it SHALL reset pagination to page 1

#### Scenario: User changes pages
- **WHEN** the user selects another page
- **THEN** the system SHALL request that page with the same project and filters and display saved title, status, nullable executor fallback, startedAt and completedAt
- **AND** it SHALL preserve returned order without claiming a frozen snapshot across pages

#### Scenario: Filters are not persisted
- **WHEN** the user reloads or ordinarily re-enters a history page
- **THEN** status/date filters and pagination SHALL start from defaults rather than restored URL, storage or global state
- **AND** the route's scenario scope SHALL still apply

### Requirement: Calendar date boundaries

Started-date requests SHALL serialize RFC 3339 timestamps with explicit timezones. A calendar start SHALL represent inclusive local midnight as startedFrom; an inclusive calendar end SHALL represent exclusive midnight on the next local calendar date as startedBefore. Either bound SHALL work independently. Invalid dates or reversed ranges SHALL produce validation feedback without submitting invalid filters.

#### Scenario: Inclusive end crosses daylight saving
- **WHEN** the selected end date is a local day whose duration differs from 24 hours
- **THEN** startedBefore SHALL use the next local calendar day's midnight rather than adding a fixed 24 hours

#### Scenario: User supplies one boundary
- **WHEN** only a start or end date is selected
- **THEN** the request SHALL contain only its corresponding serialized boundary

### Requirement: History states and isolation

History SHALL show loading, error with retry, empty history and no-filter-matches states. Project changes SHALL reset filters, page and visible state immediately. Responses from other projects or previous filter/page scopes SHALL NOT appear as current results or cause navigation/messages in the new scope.

#### Scenario: Filtered query has no matches
- **WHEN** a filtered history request succeeds without runs
- **THEN** the system SHALL explain that no runs match and offer clearing filters

#### Scenario: Unfiltered history is empty or fails
- **WHEN** an unfiltered request returns no runs or the request fails
- **THEN** the system SHALL show respectively empty-history guidance or useful error feedback with retry

#### Scenario: Project changes during a request
- **WHEN** the selected project changes while history is pending
- **THEN** the first request in the new project SHALL use page 1 and default filters
- **AND** old responses SHALL NOT populate its view

### Requirement: Preserved source provenance

History and run detail SHALL display Source deleted when testScenarioId is null. When the relation exists, run detail SHALL provide View current scenario linking to its saved detail and explain that current content may differ from the run snapshot. The system SHALL always display run snapshots as history and SHALL NOT replace them with current scenario content or assert detected drift.

#### Scenario: Live source differs from a run snapshot
- **WHEN** the source scenario was edited after a run began
- **THEN** run detail SHALL retain the saved snapshot and provide the separate current-scenario link and difference explanation

#### Scenario: Source is deleted
- **WHEN** a run's live source relation is null
- **THEN** history and detail SHALL show Source deleted, omit the live-source link and retain readable saved content
- **AND** they SHALL offer project history filtered by sourceTestScenarioId without requiring that source in the live scenario catalog

#### Scenario: Nested source history becomes unavailable
- **WHEN** nested scenario history reports source not found
- **THEN** the system SHALL offer project history filtered by that original scenario ID
- **AND** it SHALL NOT misrepresent the error as no historical runs

### Requirement: Resume existing active runs

Active history rows SHALL provide Resume, opening the existing detail route without starting a run. Completed rows SHALL provide view access to read-only detail. Active runs SHALL NOT offer Retest; active runs with deleted sources SHALL remain resumable.

#### Scenario: User resumes a detached active run
- **WHEN** the user activates Resume for an in_progress run whose source was deleted
- **THEN** the system SHALL open that same persisted run without a start request
- **AND** execution SHALL remain available through the existing execution rules

### Requirement: Fresh retest from completed detail

Retest SHALL be available only on completed run detail with a non-null live source relation. The system SHALL explain that it starts from current saved scenario content and steps, use the existing start endpoint with selected projectId, and SHALL NOT copy historical outcomes/notes, modify the original snapshot, reopen a completed run or imply persisted lineage.

#### Scenario: Retest succeeds
- **WHEN** the user activates Retest on eligible completed detail
- **THEN** the system SHALL start a distinct run using the live scenario ID and an empty valid start body
- **AND** it SHALL navigate only after a successful response in the still-current scope
- **AND** the original completed run SHALL remain unchanged

#### Scenario: Retest is pending or fails
- **WHEN** retest is pending, fails or has an ambiguous transport result
- **THEN** duplicate submissions SHALL be prevented while pending, failures SHALL retain the historical view, and ambiguous results SHALL warn that a run may exist without automatically replaying the start
- **AND** history SHALL be available for inspecting potentially created runs

#### Scenario: Source deletion races with retest
- **WHEN** the source disappears before retest can start
- **THEN** the system SHALL retain historical detail, explain the unavailable source and refresh authoritative source availability without creating a historical-version rerun

### Requirement: History refresh after execution

Successful starts and completions SHALL refresh relevant project and source history. Query identity SHALL include project and all filters/pagination, and refresh SHALL NOT leak old-project results.

#### Scenario: User completes or retests a run
- **WHEN** completion or retest succeeds
- **THEN** subsequent affected history SHALL reflect the persisted outcome or new run through refreshed scoped caches
