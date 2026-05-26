## ADDED Requirements

### Requirement: Repository SHALL declare Apache 2.0 consistently
The repository SHALL declare Apache 2.0 as its active license consistently across root licensing artifacts, package metadata, and top-level documentation.

#### Scenario: Root license artifacts are present
- **WHEN** a contributor inspects the repository root
- **THEN** the repository SHALL include a `LICENSE` file containing the Apache License 2.0 text
- **AND** the repository SHALL expose Apache 2.0 as the canonical license in its top-level metadata and documentation

#### Scenario: Package metadata is inspected
- **WHEN** a tool or contributor reads `package.json`
- **THEN** the `license` field SHALL be set to the SPDX identifier `Apache-2.0`

### Requirement: Repository documentation SHALL point contributors to the active license
The repository SHALL include contributor-facing documentation that identifies Apache 2.0 as the project license and points readers to the canonical root license file.

#### Scenario: README license section is reviewed
- **WHEN** a contributor reads the repository README
- **THEN** the README SHALL identify Apache 2.0 as the project license
- **AND** the README SHALL direct contributors to the root `LICENSE` file for the full terms
