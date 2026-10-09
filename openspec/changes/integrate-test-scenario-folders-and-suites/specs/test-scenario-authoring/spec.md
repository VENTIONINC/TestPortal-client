# Spec Delta

## ADDED Requirements

### Requirement: Scenario forms support optional folder placement
Scenario creation and editing SHALL support an optional folder in the currently selected project and allow the scenario to remain Unfiled.

#### Scenario: Create from a folder
- **WHEN** a user starts scenario creation from a selected folder
- **THEN** the form SHALL default the folder to that folder UUID
- **AND** the create request SHALL include the selected project ID and folder UUID

#### Scenario: Create without a folder
- **WHEN** a user creates a scenario without selecting a folder
- **THEN** the request SHALL omit folder assignment or submit null according to the generated contract
- **AND** the scenario SHALL remain available under Unfiled

#### Scenario: Change or clear folder while editing
- **WHEN** a user changes or clears the folder on an existing scenario
- **THEN** the update request SHALL include the folder UUID or null
- **AND** preserve all unchanged structured fields and scenario identity

#### Scenario: Folder belongs to another project
- **WHEN** the backend rejects a folder assignment outside the selected project
- **THEN** the form SHALL retain the user's draft and display the API error
