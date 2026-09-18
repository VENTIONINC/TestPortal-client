## MODIFIED Requirements

### Requirement: Scenario deletion

The system SHALL require confirmation before deleting a scenario, SHALL identify the scenario by its persisted title, and SHALL require the user to enter that exact title before deletion is enabled. Confirmation SHALL explain that existing manual test runs and their saved snapshots are preserved and new runs can no longer be started from the deleted scenario. Successful deletion SHALL refresh related run/history source availability as well as scenario presentation.

#### Scenario: Delete confirmation opens from the row menu
- **WHEN** the user selects **Delete Scenario** for a catalog row
- **THEN** the system SHALL open an alert dialog identifying the scenario by its persisted title
- **AND** the dialog SHALL explain exact-title confirmation, preserved manual runs/snapshots and unavailable future starts
- **AND** the destructive confirmation action SHALL initially be disabled

#### Scenario: Confirmation title does not match
- **WHEN** the confirmation input does not match the persisted scenario title exactly, including case and whitespace
- **THEN** the destructive confirmation action SHALL remain disabled
- **AND** the system SHALL NOT send a delete request

#### Scenario: Confirmation title matches
- **WHEN** the confirmation input matches the persisted scenario title exactly, including case and whitespace
- **THEN** the destructive confirmation action SHALL become enabled

#### Scenario: User confirms deletion
- **WHEN** the user confirms deletion after entering the exact persisted scenario title
- **THEN** the system SHALL delete it using both its scenarioId and selected projectId
- **AND** it SHALL close confirmation after success and navigate to `/test-scenarios`
- **AND** the deleted scenario SHALL no longer remain in the cached catalog UI
- **AND** affected run/history presentation SHALL refresh to show Source deleted and unavailable Retest without deleting runs or copied steps

#### Scenario: User cancels deletion
- **WHEN** the user cancels delete confirmation
- **THEN** the system SHALL close confirmation without sending a delete request

#### Scenario: Deletion fails
- **WHEN** the delete request fails
- **THEN** the system SHALL keep the user on the catalog or details page from which deletion was opened
- **AND** it SHALL display clear deletion feedback
- **AND** it SHALL preserve matching confirmation input so the user can retry or cancel
