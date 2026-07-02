## ADDED Requirements

### Requirement: Delete project confirmation SHALL identify the selected project
The system SHALL display the selected project name in the delete confirmation dialog before a user confirms project deletion from Settings.

#### Scenario: Delete confirmation is opened for an inactive project
- **WHEN** a user opens the project context menu in Settings and chooses `Delete Project` for an inactive project
- **THEN** the system SHALL open a delete confirmation dialog that includes the selected project's name in the confirmation message
- **AND** the dialog SHALL retain destructive-action messaging that indicates deletion is permanent and cannot be undone

#### Scenario: User reviews deletion target before confirming
- **WHEN** the delete confirmation dialog is visible
- **THEN** the system SHALL present enough object-specific context for the user to distinguish which project will be removed before clicking the destructive action button
