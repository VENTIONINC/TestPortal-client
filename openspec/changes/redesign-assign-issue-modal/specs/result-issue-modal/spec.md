## ADDED Requirements

### Requirement: Unified result issue modal
The client SHALL use one modal for inspecting a result error and assigning or editing its issue, replacing the separate result-error dialog and issue-management drawer for Results-tab entry points.

#### Scenario: Open from error message
- **WHEN** a user selects an error message in a Results row
- **THEN** the client opens the result issue modal for that result error with both evidence and assignment panes visible

#### Scenario: Open from add control
- **WHEN** a user selects the add-issue control for an unassigned result error
- **THEN** the client opens the same result issue modal in assignment mode

#### Scenario: Open from confirmed issue
- **WHEN** a user selects a confirmed-issue pill
- **THEN** the client opens the same result issue modal in confirmed edit mode with the assigned issue loaded

#### Scenario: Responsive presentation
- **WHEN** the modal is rendered at a viewport too narrow for two usable columns
- **THEN** the client presents the evidence and assignment areas in a responsive layout without hiding either workflow

### Requirement: Result context title
The modal SHALL identify the selected result in a single title row using its result number, attempt number, start time, and duration, and SHALL provide a close action.

#### Scenario: Complete result context
- **WHEN** result metadata is available
- **THEN** the modal title displays `Result #{resultId} · Attempt #{attempt} · Started {time} · Duration {duration}` using the application's established date and duration formatting

### Requirement: Error evidence navigation
The modal SHALL provide Error, Logs, Snippet, and Test Case evidence tabs and SHALL retain the user's form edits when switching between them.

#### Scenario: Error evidence is available
- **WHEN** the Error tab is active
- **THEN** the client displays each available Error Message, Call Log, and Call Stack section with an independent Copy action

#### Scenario: Optional error section is absent
- **WHEN** an Error-tab section has no value
- **THEN** the client omits that section without hiding other available error evidence

#### Scenario: Logs are unavailable
- **WHEN** the selected result has no logs supplied by the backend
- **THEN** the Logs tab displays an explicit empty state instead of fabricated content

#### Scenario: Source snippet is unavailable
- **WHEN** the selected result has no source path and snippet supplied by the backend
- **THEN** the Snippet tab displays an explicit empty state

#### Scenario: Source snippet is available
- **WHEN** the selected result includes a spec file path, source snippet, and failing-line location
- **THEN** the Snippet tab displays the path and code with the failing line visibly marked

#### Scenario: Generated test case is unavailable
- **WHEN** no generated test case is supplied
- **THEN** the Test Case tab displays `A generated test case will appear here once available.`

### Requirement: Assignment form
The assignment pane SHALL provide category selection, Issue Name, Description, name and description polish actions, and actions appropriate to the current workflow state.

#### Scenario: Enter issue manually
- **WHEN** no suggestion is selected and the user supplies valid category, name, and description values
- **THEN** the form enables its applicable assignment action

#### Scenario: Validation fails
- **WHEN** the user attempts to assign or update with invalid required values
- **THEN** the modal remains open and displays field-level validation without discarding entered values

#### Scenario: Switch evidence tab while editing
- **WHEN** the user changes evidence tabs after editing assignment fields
- **THEN** all assignment field values and the selected category remain unchanged

### Requirement: Issue assignment lifecycle
The modal SHALL preserve create, assign, update, unassign, confirm, reject, cancel, and close semantics without deleting the underlying issue as a side effect of unassignment.

#### Scenario: Assign a new issue
- **WHEN** an unassigned user submits valid details that do not identify an existing issue
- **THEN** the client creates the issue, assigns it to the selected result error as a user-confirmed association, refreshes affected result data, and closes the modal after success

#### Scenario: Assign an existing issue
- **WHEN** an unassigned user selects an existing issue and confirms assignment
- **THEN** the client associates that issue with the selected result error without creating a duplicate issue

#### Scenario: Update a confirmed issue
- **WHEN** a user changes valid fields in confirmed edit mode and selects Update
- **THEN** the client updates the issue, refreshes affected data, and closes the modal after success

#### Scenario: Unassign a confirmed issue
- **WHEN** a user selects Unassign in confirmed edit mode and confirms the action
- **THEN** the client removes the result-error association while preserving the issue itself

#### Scenario: Cancel editing
- **WHEN** a user selects Cancel in confirmed edit mode
- **THEN** the modal closes without persisting form changes

#### Scenario: Persistence fails
- **WHEN** a create, assign, update, confirm, reject, or unassign request fails
- **THEN** the modal remains open, preserves recoverable form state, and displays an actionable error

### Requirement: Theme support and accessibility
The modal SHALL support the application's light and dark themes and SHALL expose keyboard and assistive-technology semantics for tabs, fields, popovers, copy controls, and footer actions.

#### Scenario: Change color mode
- **WHEN** the application uses either light or dark mode
- **THEN** both panes, all state banners, controls, and evidence surfaces retain readable contrast using theme tokens

#### Scenario: Keyboard navigation
- **WHEN** a keyboard user interacts with the modal
- **THEN** focus is trapped within the open modal, tab selection and actions are reachable, visible focus is preserved, and closing returns focus to the invoking control

### Requirement: Results-tab AI action removal
The Results row SHALL no longer offer the inline Categorise with AI action that writes analysis category and confidence directly onto a Result.

#### Scenario: Result has errors without analysis
- **WHEN** a Results row contains errors and has no result analysis
- **THEN** the row does not render the sparkles Categorise with AI button

#### Scenario: Existing result analysis remains available
- **WHEN** a Results row already has analysis data
- **THEN** the existing analysis badge and analysis review flow remain available independently of issue assignment

