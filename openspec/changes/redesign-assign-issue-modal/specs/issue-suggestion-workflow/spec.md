## ADDED Requirements

### Requirement: Explicit assignment workflow state
The assignment pane SHALL derive one visible state from `opening-searching`, `categorising-ai`, `unassigned`, `suggested-algorithm`, `suggested-ai`, `no-similar-found`, `categorise-error`, `find-similar-error`, or `confirmed`, and SHALL prevent stale asynchronous responses from replacing a newer state.

#### Scenario: State-specific feedback and actions
- **WHEN** the assignment workflow enters any defined state
- **THEN** the pane displays that state's prescribed feedback and only the footer actions valid for that state

#### Scenario: Modal closes during a request
- **WHEN** a matching or categorisation request completes after its modal instance has closed or changed to another result error
- **THEN** the stale response does not update the current modal state

### Requirement: Automatic similar-issue matching
The client SHALL initiate a similar-issue lookup when assignment mode opens, SHALL present an algorithmic match for review when one is returned, and SHALL allow manual name search regardless of automatic lookup outcome.

#### Scenario: Search begins on open
- **WHEN** the modal opens for an unassigned result error
- **THEN** the assignment pane enters `opening-searching` and displays `Looking for issues that match this error…`

#### Scenario: Similar issue is found
- **WHEN** the lookup returns a candidate issue, similarity score, and affected-test count
- **THEN** the pane enters `suggested-algorithm`, loads the candidate into the form, displays a `{score}% match` badge and `This issue affected {count} more tests`, and offers Reject and Confirm

#### Scenario: Similar issue is confirmed
- **WHEN** a user confirms an algorithmic suggestion
- **THEN** the client confirms or creates the association for that candidate and refreshes affected result data

#### Scenario: Similar issue is rejected
- **WHEN** a user rejects an algorithmic suggestion
- **THEN** the client records the rejection through the supported assumption contract and returns the pane to editable unassigned behavior

#### Scenario: No similar issue is found
- **WHEN** the lookup completes without a candidate
- **THEN** the pane enters `no-similar-found` and displays `No similar issues were found for this error. Fill out the form manually, or use Categorise with AI…`

#### Scenario: Similar lookup fails
- **WHEN** the automatic lookup fails
- **THEN** the pane enters `find-similar-error`, displays `Couldn't check for matching issues. Search by name above, or retry.`, and offers Retry

#### Scenario: Retry similar lookup
- **WHEN** a user selects Retry from `find-similar-error`
- **THEN** the client starts a new lookup for the current result error and returns to `opening-searching`

#### Scenario: Search existing issues by name
- **WHEN** the user enters an issue name search term
- **THEN** the client debounces the project-scoped lookup and allows the user to select a matching existing issue without waiting for automatic similarity matching

### Requirement: Similarity explanation
An algorithmic suggestion SHALL provide an explainer that states the score is similarity rather than probability, identifies the comparison signals, and warns about look-alike flaky and timeout failures.

#### Scenario: Open score explanation
- **WHEN** a user opens `What does {score}% mean?`
- **THEN** the client explains that the score compares error message text, call stack shape, and test file/spec, is not a probability, and can overstate similarity for flaky or timeout errors across unrelated tests

### Requirement: AI-assisted issue categorisation
The assignment pane SHALL let a user request an AI draft from the selected result error and SHALL keep the draft unconfirmed until the user reviews and assigns it.

#### Scenario: Categorisation begins
- **WHEN** a user selects Categorise with AI in an eligible assignment state
- **THEN** the pane enters `categorising-ai`, displays `Drafting a category, name and description from this error…`, and prevents duplicate categorisation requests

#### Scenario: Categorisation succeeds
- **WHEN** the AI service returns a category, name, and description
- **THEN** the pane enters `suggested-ai`, populates all three fields, displays `AI-generated suggestion` and `Category, name and description were drafted from this error. Review before assigning.`, and requires user confirmation before persistence

#### Scenario: Categorisation fails
- **WHEN** the AI categorisation request fails
- **THEN** the pane enters `categorise-error`, preserves editable values, displays `Couldn't draft the issue details. Fill them in below, or retry.`, and offers Retry

#### Scenario: Retry categorisation
- **WHEN** a user selects Retry from `categorise-error`
- **THEN** the client starts a new request for the current result error and returns to `categorising-ai`

### Requirement: AI suggestion provenance
An AI-generated suggestion SHALL provide an explainer with the exact model inputs and category precedence used by the feature.

#### Scenario: Open generation explanation
- **WHEN** a user opens `How this suggestion was generated`
- **THEN** the client lists the error message, stack trace, error location, test title, spec file, status, duration, retry count, execution name, and environment as model inputs, and lists category priority as Environment, Performance, Script, Bug, then Other

### Requirement: Field-level AI polish
The assignment pane SHALL allow the Issue Name and Description to be polished independently through the message formatter while retaining an undoable previous value.

#### Scenario: Polish one field
- **WHEN** a user invokes polish for a non-empty Issue Name or Description
- **THEN** the client sends the current form context and selected canonical category to the formatter and updates only the requested field from the response

#### Scenario: Undo polished field
- **WHEN** a polish action succeeds and the user selects Undo for that field
- **THEN** the client restores that field's value from immediately before the latest successful polish

#### Scenario: Polish fails
- **WHEN** a field polish request fails
- **THEN** the client keeps the current field value, identifies the failed field, and offers Retry without changing the other field

#### Scenario: Retry field polish
- **WHEN** a user retries a failed field polish
- **THEN** the client resubmits only that field's polish operation using the current form context

### Requirement: Confirmed edit state
The assignment pane SHALL enter `confirmed` when opened from a confirmed association and SHALL present Unassign, Update, and Cancel actions without running automatic matching or AI categorisation.

#### Scenario: Open confirmed assignment
- **WHEN** the modal opens from a confirmed-issue pill
- **THEN** the pane loads the confirmed issue, enters `confirmed`, and does not initiate similar-issue lookup

