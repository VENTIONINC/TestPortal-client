## MODIFIED Requirements

### Requirement: Skills Catalog Display
The system SHALL fetch and display all skills returned by the authenticated skills catalog API and SHALL use each persisted skill ID as the stable identity for client navigation and rendering.

#### Scenario: Catalog contains skills
- **WHEN** the Skills Hub catalog request succeeds with one or more skills
- **THEN** the system displays each skill with its human-readable title, description, category, and available version or license metadata

#### Scenario: User selects a catalog skill
- **WHEN** an authenticated user selects a skill from the catalog
- **THEN** the system navigates to `/skills/{id}` using the persisted ID returned for that catalog entry

#### Scenario: Catalog contains skills with duplicate or changed names
- **WHEN** catalog entries have a duplicate display name or a custom skill's name changes without changing its persisted ID
- **THEN** the system continues to identify, render, and navigate to each entry by its persisted ID

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
The system SHALL load a persisted skill by the ID in the `/skills/{id}` route and display the returned human-readable metadata and Markdown content preview without presenting the ID as the skill name or title.

#### Scenario: User opens a skill from the catalog
- **WHEN** an authenticated user selects a catalog entry with a persisted skill ID
- **THEN** the system requests that skill by ID and displays its returned name, title, metadata, and Markdown content preview

#### Scenario: User directly opens or refreshes an ID-based detail route
- **WHEN** an authenticated user directly navigates to or refreshes `/skills/{id}` without first loading the catalog
- **THEN** the system requests the skill by the route ID and renders the detail view independently of catalog state

#### Scenario: Custom skill name changes
- **WHEN** a custom skill's human-readable name changes while its persisted ID remains unchanged
- **THEN** the same `/skills/{id}` route remains reachable and displays the updated name

#### Scenario: Skill ID is unknown or malformed
- **WHEN** the backend returns not found for the ID in the detail route
- **THEN** the system displays the existing skill not-found state

#### Scenario: Detail route is missing an ID
- **WHEN** no non-empty persisted skill ID is available from the detail route
- **THEN** the system does not issue a detail request and displays the skill not-found state

#### Scenario: Skill Markdown contains GitHub-flavored Markdown
- **WHEN** the skill content includes common GitHub-flavored Markdown such as headings, lists, links, tables, task lists, or code blocks
- **THEN** the system renders the content in a readable preview using the application theme

#### Scenario: Detail page navigation labels are rendered
- **WHEN** the detail page header or breadcrumb is displayed before or after detail data loads
- **THEN** the system uses a human-readable label and does not format or expose the persisted ID as a skill name

### Requirement: Authenticated Skill Artifact Downloads
The system SHALL treat the complete ZIP package referenced by the selected skill's `downloadUrl` as the only downloadable/installable artifact and SHALL keep detail Markdown available only as preview/source content.

#### Scenario: User downloads zip archive
- **WHEN** an authenticated user activates the archive download action for a loaded skill
- **THEN** the system requests the catalog-provided `downloadUrl` through the authenticated API layer and downloads the complete portable ZIP package

#### Scenario: Download URL identifies the selected skill
- **WHEN** the backend returns `downloadUrl` for a persisted skill ID
- **THEN** the system uses that URL for the ZIP action without substituting the skill's human-readable name into the artifact route

#### Scenario: User inspects detail Markdown
- **WHEN** a skill detail response contains Markdown content
- **THEN** the system renders that content as readable preview/source information and does not label it as a complete installable artifact

#### Scenario: User views available download actions
- **WHEN** the skill detail page is rendered
- **THEN** the system exposes a ZIP package download action and does not expose a standalone raw Markdown download action

#### Scenario: Client prepares skill artifact requests
- **WHEN** the client prepares available artifact queries for a skill
- **THEN** the system does not call or expose `GET /api/v2/skills/{id}/download`

#### Scenario: Backend supplies a download filename
- **WHEN** an artifact response includes a valid content-disposition filename
- **THEN** the system uses the backend-provided human-readable filename

#### Scenario: Backend omits a download filename
- **WHEN** an artifact response does not include a usable content-disposition filename
- **THEN** the system derives a deterministic human-readable ZIP filename from the loaded skill name rather than its persisted ID

#### Scenario: Download request fails
- **WHEN** the ZIP archive download request fails for a non-authentication reason
- **THEN** the system communicates the failure to the user without leaving the page in a broken state

#### Scenario: Download request receives unauthorized response
- **WHEN** a download request receives an unauthorized response
- **THEN** the system applies the existing authenticated API session handling behavior
