## MODIFIED Requirements

### Requirement: Test Scenario summary presentation

The catalog SHALL present returned summaries in a table with Scenario key immediately before Title, followed by Details, Created by, Created, Updated and existing actions, without rendering or depending on Markdown content. Scenario key SHALL display scenarioKey or N/A for null and SHALL wrap long values. Loading presentation SHALL align with the same columns.

#### Scenario: Catalog contains scenarios

- **WHEN** the selected project's list response contains one or more scenarios
- **THEN** the catalog SHALL display one table row per scenario
- **AND** each row SHALL show its key/fallback under Scenario key, title under Title, summary details and creator metadata, and creation/update timestamps under Created and Updated
- **AND** the catalog SHALL NOT display contentMd

#### Scenario: List response includes Markdown content

- **WHEN** the backend list response includes contentMd on scenario records
- **THEN** the catalog SHALL ignore that field
- **AND** rendering SHALL remain based only on summary fields

#### Scenario: Scenario summary is displayed

- **WHEN** a scenario is shown in this catalog
- **THEN** the catalog SHALL provide the creation, detail, editing, and deletion entry points defined by the Test Scenario authoring requirements
- **AND** the catalog SHALL NOT offer inline Markdown preview, relationship, or evidence actions

#### Scenario: Summary key is missing or long

- **WHEN** a summary has no key or a long valid key
- **THEN** its dedicated key cell SHALL show N/A or wrap the key without replacing the title
- **AND** title links and actions SHALL continue using scenario UUIDs
