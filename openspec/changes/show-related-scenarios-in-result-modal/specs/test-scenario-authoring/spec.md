## MODIFIED Requirements

### Requirement: Structured scenario presentation

The system SHALL present Test Scenarios through structured fields and ordered steps on the scenario details and editing routes. Generated `contentMd` and hash/version SHALL remain integration data and SHALL NOT be displayed as a Markdown preview or raw source on those routes, edited, parsed into fields, generated, or submitted by the client. The Result issue modal SHALL render the backend-generated `contentMd` of an explicitly linked scenario as read-only content in its evidence pane.

#### Scenario: User views scenario details
- **WHEN** the details page loads or saved data refreshes
- **THEN** the system SHALL display persisted structured fields and ordered steps without Markdown preview or source controls

#### Scenario: User edits a scenario
- **WHEN** the edit page loads, drafts change, or a field or step mutation succeeds
- **THEN** the system SHALL display structured editing controls without a saved Markdown preview or raw source view

#### Scenario: User inspects a linked scenario from a Result
- **WHEN** the Result issue modal shows an explicitly linked Test Scenario
- **THEN** the system SHALL render its backend-generated Markdown as read-only content within the modal
- **AND** it SHALL NOT offer Markdown editing, source controls, or a separate Markdown page
