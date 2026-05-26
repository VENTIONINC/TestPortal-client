# file-header-scaffolding Specification

## Purpose
TBD - created by archiving change adopt-apache-license-and-file-header-tool. Update Purpose after archive.
## Requirements
### Requirement: Repository SHALL provide a headered file creation command
The repository SHALL provide a package script named `new:file` that creates a new file at a caller-supplied path for supported file types.

#### Scenario: Command is invoked with a valid new path
- **WHEN** a developer runs the package `new:file` command with a supported file path that does not already exist
- **THEN** the command SHALL create any missing parent directories
- **AND** the command SHALL create the target file at the requested path
- **AND** the new file SHALL begin with the standard repository Apache 2.0 source header

#### Scenario: Command is invoked without a path
- **WHEN** a developer runs the package `new:file` command without providing a target path
- **THEN** the command SHALL fail with a clear usage error
- **AND** the command SHALL not create any files

#### Scenario: Command targets an existing file
- **WHEN** a developer runs the package `new:file` command and the target file already exists
- **THEN** the command SHALL fail without overwriting the existing file

#### Scenario: Command targets an unsupported extension
- **WHEN** a developer runs the package `new:file` command with an unsupported file extension
- **THEN** the command SHALL fail with a clear unsupported-extension error
- **AND** the command SHALL identify the supported extension set

### Requirement: Command SHALL apply the Apache 2.0 source header for supported code files
For supported TypeScript and JavaScript-family source file extensions, repository header tooling SHALL apply the standard Apache 2.0 source header.

#### Scenario: Supported code file is created
- **WHEN** a developer creates a supported TypeScript or JavaScript-family file with the package `new:file` command
- **THEN** the new file SHALL begin with `Copyright 2026 Vention`
- **AND** the new file SHALL include the SPDX identifier `Apache-2.0` in the file header

#### Scenario: Supported extension list is inspected
- **WHEN** a developer reviews the file header workflow documentation
- **THEN** the documentation SHALL identify `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, and `.cjs` as supported extensions

### Requirement: Repository SHALL provide a bulk header backfill command
The repository SHALL provide a package script that scans configured source directories and prepends the standard Apache 2.0 header when it is missing from supported files.

#### Scenario: Bulk backfill is run
- **WHEN** a developer runs the repository bulk header command
- **THEN** the command SHALL scan supported files under the repository's configured source directories
- **AND** the command SHALL add the standard header only to supported files that do not already contain it
- **AND** the command SHALL leave already-headered supported files unchanged
- **AND** the command SHALL ignore unsupported files

### Requirement: Generated source handling SHALL be explicit
The repository SHALL define whether generated source files are excluded from header backfill or receive the standard header through a regeneration-safe workflow.

#### Scenario: Generated API source is considered for header backfill
- **WHEN** the bulk header command processes client source files
- **THEN** generated RTK Query API output SHALL either be excluded from the scan or receive the standard header through an automated post-generation step
- **AND** the repository documentation SHALL describe the chosen generated-source behavior

