## Purpose

Let a user inspect the Test Scenarios that currently cover an automated Result while remaining in the existing Result issue modal and preserving issue-assignment work.

## ADDED Requirements

### Requirement: Scenario tab in the Result issue modal

The modal SHALL provide a Test Scenarios tab in its left evidence rail below Logs. Selecting the tab SHALL show scenario content in the modal's evidence pane and SHALL preserve any unsaved issue-assignment fields and selected category.

#### Scenario: User opens the scenario tab
- **WHEN** a user selects the Test Scenarios icon while the Result issue modal is open
- **THEN** the modal displays the related-scenario view within its evidence pane
- **AND** the issue-assignment pane remains available

#### Scenario: User switches evidence tabs while editing an issue
- **WHEN** a user changes between Test Scenarios and another evidence tab after editing issue fields
- **THEN** the issue fields and selected category retain their current unsaved values

#### Scenario: Optional error evidence is absent
- **WHEN** Logs, Snippet, and generated Test Case are absent for the selected Result error
- **THEN** the Test Scenarios tab remains available alongside Error

### Requirement: Project-scoped explicit scenario retrieval

The client SHALL request the selected Result's detail using its Result ID and selected project ID. It SHALL use `relatedTestScenarios` from that response as the sole source of scenarios shown in this tab, without mixing in semantic or AI suggestions. Each item SHALL retain the backend's order and include its `id`, `title`, nullable `details`, and current generated `contentMd` string.

#### Scenario: One or more scenarios are linked
- **WHEN** the Result detail response contains one or more `relatedTestScenarios`
- **THEN** the tab lists every returned scenario once in response order and identifies each by title

#### Scenario: No scenarios are linked
- **WHEN** the Result detail response contains `relatedTestScenarios: []`
- **THEN** the tab displays a clear state that no Test Scenarios are linked to this Result's Spec

#### Scenario: Result or project changes
- **WHEN** the modal targets another Result or the selected project changes while a detail request is pending or cached
- **THEN** the tab SHALL NOT display scenario data belonging to the previous Result or project

### Requirement: Read-only scenario inspection within the modal

The user SHALL be able to select a listed scenario and inspect its current `title`, nullable `details`, and backend-generated `contentMd` in the same modal. The Markdown SHALL be rendered as read-only content, without editing or submitting it, and the user SHALL be able to return to the list when multiple scenarios are linked.

#### Scenario: User selects a linked scenario
- **WHEN** a user selects a scenario from the tab's list
- **THEN** its current content opens in the modal's evidence pane without navigating away or closing the modal

#### Scenario: Scenario details are null
- **WHEN** the selected scenario has `details: null`
- **THEN** the view handles the absence without showing a blank or broken field

### Requirement: Scenario request states

The scenario tab SHALL present distinguishable loading, unavailable-Result, and failed-request states. A failed request SHALL offer a retry and SHALL NOT be presented as an empty link set.

#### Scenario: Detail request is loading
- **WHEN** the Result detail request is pending and no current response is available
- **THEN** the tab shows a loading state without showing stale scenarios

#### Scenario: Detail request fails
- **WHEN** the Result detail request fails
- **THEN** the tab shows an error with a retry action instead of a no-links message

#### Scenario: Result is unavailable in the selected project
- **WHEN** the Result detail request reports that the Result is absent from the selected project
- **THEN** the tab shows an unavailable state without exposing scenario information
