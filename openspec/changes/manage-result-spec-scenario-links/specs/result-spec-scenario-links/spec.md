## Purpose

Let users manage existing Test Scenario coverage of a Result's Spec inside the Result modal while preserving investigation context and unsaved issue-assignment work.

## ADDED Requirements

### Requirement: Spec-wide coverage management

The Test Scenarios tab SHALL offer Link Test Scenario in successful empty and populated linked-list states. It SHALL explain that links apply to all past and future Results of this Spec and represent current coverage. Management SHALL use the Spec UUID returned by the selected Result detail, never a title, file, test key or Result UUID as a substitute. Controls SHALL remain unavailable until the current Result detail and Spec identity are available. Existing error-based modal access and read-only scenario inspection SHALL remain supported.

#### Scenario: Empty or populated coverage
- **WHEN** the current Result detail successfully returns zero or more linked scenarios and its Spec UUID
- **THEN** Link Test Scenario is available and the user can read the Spec-wide explanation

#### Scenario: Detail is unavailable
- **WHEN** the selected Result detail is loading, fails or is unavailable
- **THEN** the client shows the corresponding request state and does not permit a write using stale or inferred Spec identity

### Requirement: Project catalog picker

The client SHALL provide a picker within the modal evidence pane listing existing scenarios from the selected project with current scenarioKey (`N/A` for null), title and nullable details. It SHALL use server-side case-insensitive literal substring search of title and scenarioKey, trim surrounding search whitespace, omit blank search, and provide an explicit Search action. Details SHALL be displayed but SHALL NOT be advertised or treated as searchable. Requests SHALL apply search before pagination, retain it across page changes, use limit 10 and server totals/order, and reset to page 1 on applied search or project changes. The client SHALL distinguish loading, failure with retry, no scenarios, no search matches and an empty later page with a way to return to page 1. It SHALL NOT search by filtering only the loaded page or fetch scenario details per picker row.

#### Scenario: Scenario outside the initial page
- **WHEN** the user searches for a title or key belonging to a scenario absent from the initial page
- **THEN** the server query can return that scenario with matching pagination totals

#### Scenario: Search and pagination
- **WHEN** the user applies a new search and then changes page
- **THEN** the new search begins on page 1 and subsequent requests retain the applied search

#### Scenario: Empty and failed requests
- **WHEN** a picker request succeeds without scenarios or fails
- **THEN** the client distinguishes an empty catalog from no matches and request failure, and failure offers retry without losing search input

#### Scenario: Null labels and details
- **WHEN** a picker scenario has null scenarioKey or details
- **THEN** its key displays N/A and absent details do not produce broken content

### Requirement: Link an existing scenario

The user SHALL be able to select one unlinked scenario and explicitly submit Link. Scenarios already present in authoritative current coverage SHALL be marked Already linked and unavailable for selection. The client SHALL submit POST `/api/v2/test-scenarios/{scenarioId}/spec-links?projectId=...` with `{ specId }`, using the current project and Result detail Spec UUID. Pending writes SHALL prevent duplicate submissions. Successful linking SHALL return to the refreshed linked list and allow immediate inspection in the same modal.

#### Scenario: Successful link
- **WHEN** the user links an unlinked project scenario and the server confirms creation
- **THEN** current coverage is refreshed and the scenario can be inspected without closing the modal

#### Scenario: Known duplicate
- **WHEN** a picker scenario is already linked
- **THEN** it is clearly marked and cannot be submitted as a new link

#### Scenario: Concurrent duplicate
- **WHEN** the server reports 409 because another request already created the association
- **THEN** the client refreshes authoritative coverage, explains that it is already linked and does not report creation as successful

### Requirement: Unlink only the association

Each linked scenario SHALL provide an explicit Unlink action with confirmation identifying the scenario and explaining removal from coverage for all past and future Results of this Spec. Confirmation SHALL state that the scenario, Spec, execution history and issues are preserved. Confirmed removal SHALL use DELETE `/api/v2/test-scenarios/{scenarioId}/spec-links/{specId}?projectId=...`. Cancellation SHALL perform no write. A successful removal SHALL refresh coverage and clear any inspected selection whose link is absent.

#### Scenario: Confirmed unlink
- **WHEN** the user confirms unlink and the server confirms removal
- **THEN** the association disappears from the refreshed list and an inspected removed scenario returns to the linked-list view

#### Scenario: Cancel unlink
- **WHEN** the user cancels unlink confirmation
- **THEN** no deletion request occurs and existing coverage remains visible

### Requirement: Authoritative refresh and truthful failures

Confirmed writes SHALL refresh affected Result-detail and scenario-link caches so subsequent inspection of another Result of the same Spec reflects current coverage. The client SHALL distinguish a confirmed write followed by refresh failure from a failed write, offer refresh retry and never present stale coverage as freshly confirmed. Recoverable write failures SHALL retain picker/search or unlink-confirmation context, show feedback and permit explicit retry. Unavailable/deleted targets SHALL produce clear feedback and refresh affected data without claiming success. Link/unlink writes SHALL NOT be automatically retried after transport or server failures; uncertain outcomes SHALL offer authoritative refresh before explicit resubmission.

#### Scenario: Another Result of the same Spec
- **WHEN** a confirmed mutation is followed by inspection of another Result of that Spec
- **THEN** its detail retrieves current coverage rather than an uninvalidated cached list

#### Scenario: Failed write
- **WHEN** a link or unlink write fails
- **THEN** no success feedback appears, recoverable input is retained and the user can retry explicitly

#### Scenario: Refresh fails after confirmed write
- **WHEN** the server confirms a mutation but the subsequent detail refresh fails
- **THEN** the client explains that the change was saved but coverage could not be refreshed and offers refresh retry

#### Scenario: Deleted or unavailable target
- **WHEN** a mutation returns 404 for a scenario, Spec or association
- **THEN** the client explains that the target is unavailable, refreshes relevant data and does not treat the failed mutation as successful

### Requirement: Context isolation and issue-draft preservation

Every detail, catalog and mutation request SHALL include the selected projectId. Changing Result or project SHALL reset picker selection, search, pagination, confirmation and operation feedback; late responses or completions SHALL NOT update the new context's visible data, selection or feedback. Switching evidence tabs, entering/cancelling the picker, inspecting scenarios and managing links SHALL preserve unsaved issue name, description and category. Valid writes already sent for an old context SHALL only refresh that original context's caches.

#### Scenario: Search finishes after scope change
- **WHEN** a previous Result/project picker request completes after the modal changes scope
- **THEN** its scenarios and selection do not appear in the new context

#### Scenario: Mutation finishes after scope change or close
- **WHEN** a pending old-context mutation completes after switching Result/project or closing the modal
- **THEN** it does not close the new picker, select a scenario or display success/error feedback in a new modal context

#### Scenario: Preserve issue draft
- **WHEN** the user edits issue fields/category and then searches, links, unlinks, inspects or switches evidence tabs
- **THEN** the unsaved issue fields and category retain their values
