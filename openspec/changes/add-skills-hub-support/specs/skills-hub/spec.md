## ADDED Requirements

### Requirement: Authenticated Skills Hub Entry Point
The system SHALL provide authenticated users a Skills Hub entry point in the client navigation.

#### Scenario: User opens Skills Hub from navigation
- **WHEN** an authenticated user selects the Skills Hub navigation item
- **THEN** the system displays the Skills Hub catalog page

#### Scenario: Unauthenticated user attempts to open Skills Hub
- **WHEN** an unauthenticated user attempts to open a Skills Hub route
- **THEN** the system applies the existing protected-route authentication behavior

### Requirement: Skills Catalog Display
The system SHALL fetch and display all skills returned by the authenticated skills catalog API.

#### Scenario: Catalog contains skills
- **WHEN** the Skills Hub catalog request succeeds with one or more skills
- **THEN** the system displays each skill with title, description, category, and available version or license metadata

#### Scenario: Catalog is empty
- **WHEN** the Skills Hub catalog request succeeds with no skills
- **THEN** the system displays a clean empty state

#### Scenario: Catalog request is loading
- **WHEN** the Skills Hub catalog request is in progress
- **THEN** the system displays a loading state that matches existing client UI patterns

#### Scenario: Catalog request fails
- **WHEN** the Skills Hub catalog request fails for a non-authentication reason
- **THEN** the system displays a useful error state without crashing the page

### Requirement: Skill Detail Preview
The system SHALL allow authenticated users to open a skill detail view with metadata and Markdown content preview.

#### Scenario: User selects a skill
- **WHEN** an authenticated user selects a skill from the catalog
- **THEN** the system fetches the selected skill detail and displays its metadata and Markdown content preview

#### Scenario: Skill detail is unknown or unavailable
- **WHEN** the selected skill detail request fails because the skill is unknown or unavailable
- **THEN** the system displays a useful not-found or error state

#### Scenario: Skill Markdown contains GitHub-flavored Markdown
- **WHEN** the skill content includes common GitHub-flavored Markdown such as headings, lists, links, tables, task lists, or code blocks
- **THEN** the system renders the content in a readable preview using the application theme

### Requirement: Authenticated Skill Artifact Downloads
The system SHALL allow authenticated users to download both raw Markdown and zip archive artifacts for a selected skill.

#### Scenario: User downloads raw Markdown
- **WHEN** an authenticated user activates the raw Markdown download action for a skill
- **THEN** the system downloads the skill's `SKILL.md` artifact while preserving authentication headers

#### Scenario: User downloads zip archive
- **WHEN** an authenticated user activates the archive download action for a skill
- **THEN** the system downloads the skill's zip archive while preserving authentication headers

#### Scenario: Download request fails
- **WHEN** a raw Markdown or archive download request fails for a non-authentication reason
- **THEN** the system communicates the failure to the user without leaving the page in a broken state

#### Scenario: Download request receives unauthorized response
- **WHEN** a download request receives an unauthorized response
- **THEN** the system applies the existing authenticated API session handling behavior

### Requirement: Skills Hub Scope Boundaries
The system SHALL limit initial Skills Hub functionality to browsing, previewing, and downloading predefined backend skills.

#### Scenario: User views Skills Hub actions
- **WHEN** an authenticated user views the Skills Hub catalog or detail pages
- **THEN** the system does not expose skill creation, editing, uploading, deletion, installation, execution, or arbitrary filesystem access controls
