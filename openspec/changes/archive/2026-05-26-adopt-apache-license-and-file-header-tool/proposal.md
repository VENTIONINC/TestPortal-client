## Why

The client repository currently has no canonical repository license declaration, no contributor-facing license guidance, and no repeatable way to apply the Apache 2.0 source header convention already used by the backend. Aligning the client with the backend keeps the Test Portal repositories consistent for contributors, package metadata, and compliance tooling.

## What Changes

- Adopt Apache 2.0 as the client's declared license and add the standard license text to the repository root.
- Update package metadata and top-level documentation so Apache 2.0 is discoverable through `package.json`, README, and contributor guidance.
- Add lightweight Yarn-accessible scripts for creating supported new files with the standard Apache 2.0 header and for backfilling supported existing files.
- Standardize the source header for supported TypeScript and JavaScript-family files as:
  - `// Copyright 2026 VENSOLUTIONSGROUP LTD`
  - `// SPDX-License-Identifier: Apache-2.0`
- Document how generated RTK Query API output is handled so license headers do not silently drift after code generation.

## Capabilities

### New Capabilities

- `repository-licensing`: Defines how the client repository declares, documents, and distributes its Apache 2.0 licensing information.
- `file-header-scaffolding`: Defines the workflow for creating supported source files with the required Apache 2.0 header and backfilling existing supported files.
- `contribution-guidance`: Defines the contributor guidance needed to align client changes with the Apache 2.0 license and file-header policy.

### Modified Capabilities

None.

## Impact

- Affected files include `package.json`, `yarn.lock` if package metadata refresh is needed, `README.md`, a new root `LICENSE` file, a new `CONTRIBUTING.md`, and new scripts under `scripts/`.
- Supported source files under `src` may receive the standard header during implementation, with generated API output handled explicitly.
- The change affects repository governance and developer workflow only; it does not change runtime application behavior, API contracts, build output semantics, or deployment behavior.
