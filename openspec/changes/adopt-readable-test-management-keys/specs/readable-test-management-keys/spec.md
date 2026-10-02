## Purpose

Let users recognize scenarios and manual runs through editable readable labels, while preserving UUID identity, immutable captured source labels, and accurate project-scoped history.

## ADDED Requirements

### Requirement: Optional label contract and identity

The client SHALL treat scenarioKey and runKey as nullable, nonunique editable labels and sourceScenarioKey as a nullable server-owned snapshot. It SHALL trim surrounding whitespace, preserve case/internal spaces, reject line breaks and normalized nonblank values exceeding 100 characters, and permit duplicates. UUIDs SHALL remain route, request and relationship identifiers. Empty creation input SHALL omit the label; clearing a persisted label SHALL submit null; unchanged PATCH values SHALL be omitted. Placeholders SHALL NOT become submitted values.

#### Scenario: User submits or clears a label
- **WHEN** a user creates with blank label input or clears a previously saved label
- **THEN** creation SHALL omit the label and a changed edit SHALL submit null
- **AND** whitespace-only strings SHALL NOT be sent to the API

#### Scenario: Label validation and duplicates
- **WHEN** a user enters a duplicate valid key, a multiline key or a key exceeding the normalized limit
- **THEN** duplicate keys SHALL be allowed and invalid keys SHALL show validation feedback without a mutation or draft loss
- **AND** valid labels SHALL retain case and internal spaces after surrounding whitespace is trimmed

#### Scenario: Readable labels change
- **WHEN** a label is changed, cleared or duplicated
- **THEN** routes, request identity, row identity and relationships SHALL continue to use UUIDs
- **AND** the client SHALL NOT infer uniqueness, generate labels or infer old captured source labels

### Requirement: Scenario label authoring and detail

Scenario create/edit SHALL provide a single-line Scenario key (optional) input immediately before Title, placeholder `e.g. R1 or AUTH-LOGIN`, and helper `Up to 100 characters. Duplicate keys are allowed.` Scenario detail SHALL show Scenario key directly below its title, using N/A for null. Explicit saves SHALL persist only changed editable values, retain drafts on validation/server errors, and reconcile successful saved values without losing unrelated dirty fields. Key-only changes SHALL NOT alter or submit generated content/hash/version.

#### Scenario: Scenario key is created or edited
- **WHEN** a user saves a valid scenario key in the dedicated create/edit flow
- **THEN** the saved detail and catalog SHALL display the persisted key
- **AND** the input SHALL initialize from persisted data when editing

#### Scenario: Scenario save fails or refreshes
- **WHEN** a save fails or a saved scenario response refreshes while unrelated fields are dirty
- **THEN** errors SHALL preserve form input and successful reconciliation SHALL preserve unrelated edits
- **AND** a key-only update SHALL preserve generated content/hash/version

### Requirement: Shared optional-key start interaction

Start manual run and Retest SHALL open a shared accessible dialog with context, a blank Run key (optional) input, placeholder `e.g. RUN-1`, Cancel and Start run. Retest SHALL explain that it starts a new run using current saved scenario content; historical labels SHALL NOT be represented as current source labels. Neither path SHALL copy/generate run keys or allow overriding sourceScenarioKey. Submission SHALL preserve selected-project guards, source availability rules, duplicate prevention, and confirmed-success navigation. Cancellation SHALL submit nothing and restore trigger focus.

#### Scenario: User starts or retests with a label
- **WHEN** the user confirms the dialog with a valid optional run key
- **THEN** one scoped start request SHALL include that key or omit blank input
- **AND** confirmed current-scope success SHALL navigate to the returned UUID run
- **AND** Retest SHALL leave the original run and its execution results unchanged

#### Scenario: User opens or cancels the dialog
- **WHEN** the user opens either dialog or cancels it
- **THEN** every new dialog SHALL begin with an empty run-key input and cancellation SHALL create no run
- **AND** a deleted source SHALL remain unavailable for Retest

#### Scenario: Start fails or is uncertain
- **WHEN** a validation/server error or ambiguous transport result occurs
- **THEN** entered input SHALL remain available with actionable feedback
- **AND** ambiguous results SHALL advise history inspection, SHALL NOT retry/navigate automatically, and SHALL warn before another explicit start

### Requirement: Historical label presentation

Run detail SHALL show current runKey below its heading and Source scenario key at start in snapshot metadata. Both project and nested scenario histories SHALL show separate Run key and Scenario key columns, with Run key immediately before Title, and retain a Source column for Source deleted feedback and UUID-based source-history actions. Missing run keys and source keys SHALL use N/A. Captured source keys SHALL be rendered solely from run responses, including after source edits/deletion. Long labels SHALL remain readable through wrapping.

#### Scenario: Source is renamed or deleted
- **WHEN** a source key changes from R1 to R2 or its scenario is deleted after a run starts
- **THEN** existing runs SHALL retain their captured key, and later runs SHALL show their own server-captured key
- **AND** source deletion SHALL NOT remove historical key presentation or UUID source-history access

#### Scenario: Old run has no captured label
- **WHEN** a run has null sourceScenarioKey and its current source now has a label
- **THEN** the run SHALL show N/A without backfilling from the current source

### Requirement: Independent run-key editing and execution freeze

The client SHALL offer Run key Save and Discard to the authenticated executor on active and completed runs; foreign or null-executor runs SHALL remain view-only. Label saves SHALL submit a runKey-only PATCH and SHALL NOT submit status, notes, snapshot fields or sourceScenarioKey. Completion SHALL freeze execution results while permitting this narrow label-edit exception. Metadata saves SHALL serialize with execution writes/completion, preserve unrelated drafts, retain rejected input, and refresh authoritative saved state. Unchanged labels SHALL cause no mutation. Completion and navigation through Retest SHALL require explicitly saving or discarding unsaved label edits rather than silently dropping or implicitly submitting them.

#### Scenario: Executor edits a completed run label
- **WHEN** the executor saves or clears a completed run key
- **THEN** only runKey SHALL be submitted and the returned saved key SHALL be displayed
- **AND** status, execution notes, copied content/steps, executor and start/completion timestamps SHALL remain unchanged
- **AND** no reopen or execution mutation controls SHALL become available

#### Scenario: Label save overlaps drafts or a pending write
- **WHEN** an execution/label write is pending or unrelated execution drafts exist
- **THEN** overlapping writes SHALL be blocked and an allowed label-only response SHALL preserve unrelated drafts
- **AND** dirty label edits SHALL require explicit save/discard before completion or Retest navigation

#### Scenario: Save fails or permission is rejected
- **WHEN** a label save returns a validation, authorization or conflict error
- **THEN** label input SHALL be retained without false success
- **AND** conflicts SHALL refetch authoritative state without automatic replay, and failed recovery SHALL block further writes until recovered

#### Scenario: User discards or cannot edit
- **WHEN** the user discards label changes or views a foreign/null-executor run
- **THEN** discard SHALL restore the latest persisted label without modifying execution drafts
- **AND** foreign/null-executor runs SHALL expose label presentation without label mutation controls

### Requirement: Exact captured-key project history filter

Project history SHALL provide a `Scenario key` input with placeholder `e.g. R1 or AUTH-LOGIN`, an info icon beside its title whose hover tooltip says `Exact match, case-sensitive.`, and an explicit Apply action. Typing SHALL NOT change the applied query. Apply SHALL trim/validate input, reset page to 1, and use exact case-sensitive backend sourceScenarioKey matching combined with UUID source, status and dates. Blank Apply SHALL omit that predicate; invalid input SHALL preserve the previous applied query and show feedback. Clear filters SHALL reset input/applied values and pagination. The system SHALL explain that captured keys can match multiple scenarios. Nested scenario history SHALL NOT offer/send this filter. Filters SHALL remain ephemeral.

#### Scenario: User types and applies a captured key
- **WHEN** a user types R1 and then activates Apply
- **THEN** typing SHALL cause no key-filter request, and Apply SHALL request page 1 with sourceScenarioKey=R1 and the other applied filters
- **AND** pagination SHALL retain that exact applied key and backend totals/order

#### Scenario: Duplicates, renames or deleted sources match
- **WHEN** several source scenarios captured the same label or a matching source was renamed/deleted
- **THEN** project history SHALL display the backend's matching captured-label results without requiring a current source lookup
- **AND** UUID source-history navigation SHALL still cover that source's history across label changes

#### Scenario: User resets or enters invalid input
- **WHEN** the user applies blank input, clears all filters, or attempts an invalid key
- **THEN** blank Apply SHALL remove only the key predicate, Clear filters SHALL restore defaults and page 1, and invalid Apply SHALL show feedback without changing the applied query
- **AND** no null-label selector SHALL be inferred

### Requirement: Current labels in Result-related scenarios

The Result modal's related-scenario selection and displayed content SHALL show current scenarioKey alongside the title, using N/A for null. This feature SHALL integrate the existing #105 display scope without changing backend ordering, Spec links, read-only content, issue form drafts or evidence-tab behavior.

#### Scenario: Linked scenario key changes
- **WHEN** a linked scenario's key is present, absent or subsequently edited
- **THEN** the Result modal SHALL display its current persisted key/fallback after refresh
- **AND** tab/scenario switching SHALL preserve issue form input and existing linking behavior

### Requirement: Scoped label state and cache consistency

All label reads/writes/start requests SHALL carry selected project context; query identity SHALL include applied filters/page. Project, scenario, run or Result changes SHALL clear prior-scope label drafts/dialogs/filter state and prevent late responses from displaying data, navigating or notifying in a new scope. Successful scenario-key edits SHALL refresh current scenario and relevant Result views; successful run-key edits SHALL refresh detail and both histories. Scenario edits SHALL NOT rewrite captured keys in existing runs. Label state SHALL remain local and ephemeral.

#### Scenario: Scope changes during a request
- **WHEN** the user switches project or entity while a label query/write/start is pending
- **THEN** old-scope content and drafts SHALL clear and late responses SHALL NOT affect the new scope
- **AND** history SHALL start with default filters and page 1 in the new scope

#### Scenario: Persisted key changes refresh consumers
- **WHEN** a label save succeeds
- **THEN** affected current-label consumers SHALL display the saved value without a full-page reload
- **AND** historical source labels SHALL remain the persisted snapshots
