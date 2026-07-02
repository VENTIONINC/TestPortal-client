## Context

The backend repository already declares Apache 2.0 consistently through a root `LICENSE`, `package.json` metadata, README and contributor guidance, OpenSpec capabilities, and small Node scripts for adding standard source headers. The client repository is a Vite React TypeScript app using Yarn 3.6.4 and currently lacks the equivalent repository license artifacts, contributor guidance, and header tooling.

The client has roughly 350 TypeScript and TSX source files under `src`. One important exception is `src/redux/apis/generatedApi.ts`, which is produced by `@rtk-query/codegen-openapi` through `yarn generate-api`. Any header policy must account for generated output so regeneration does not silently remove required headers.

## Goals / Non-Goals

**Goals:**

- Establish Apache 2.0 as the canonical client repository license in source control, package metadata, and top-level documentation.
- Mirror the backend's lightweight header tooling for supported TypeScript and JavaScript-family files while adapting command examples to Yarn.
- Provide contributor guidance that explains validation commands, license expectations, and when to use the headered file-creation workflow.
- Handle generated RTK Query API output explicitly so code generation and header policy remain compatible.

**Non-Goals:**

- Introducing a CLA, DCO, or other contribution attestation workflow.
- Enforcing license headers in CI as part of this change.
- Creating a full component/template generator for frontend architecture patterns.
- Changing runtime application behavior, generated API contract behavior, deployment workflows, or UI behavior.
- Defining license headers for binary assets, fonts, images, Markdown, JSON, CSS, or shell files in this change.

## Decisions

### Use the standard Apache 2.0 repository artifacts

The client will add a root `LICENSE` file with the standard Apache License 2.0 text, set `package.json` to `Apache-2.0`, and add README license guidance that points to the root license file.

Why this approach:

- It matches the backend repository and common repository-level license conventions.
- Tools such as GitHub, package scanners, and internal compliance checks can detect the SPDX license metadata.
- It keeps the legal signal explicit without touching runtime application behavior.

Alternatives considered:

- Only adding `package.json` metadata: rejected because the repository would still lack the canonical license text.
- Only adding a `LICENSE` file: rejected because package metadata and top-level docs would remain incomplete.

### Keep the header tooling lightweight and dependency-free

The client will use small Node ESM scripts under `scripts/`, matching the backend's structure:

- `license-header-utils.js` owns the supported extensions and standard header.
- `new-file.js` creates supported new files and refuses missing, unsupported, or existing targets.
- `add-license-headers.js` scans configured source directories and prepends missing headers.

The package scripts should be named `new:file` and `headers:add`, with documentation using Yarn commands such as `yarn new:file -- <path>` and `yarn headers:add`.

Why this approach:

- It matches the repository's existing Node/Yarn workflow with no new dependency.
- It is easy to compare with the backend and maintain across both repositories.
- It avoids introducing a heavier generator for a narrow licensing workflow.

Alternatives considered:

- A shell script: rejected because cross-platform path handling and extension branching are less predictable.
- A scaffolding dependency: rejected as unnecessary for a two-line header.

### Scope supported headers to TypeScript and JavaScript-family files

The first implementation should support `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, and `.cjs` using:

```text
// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
```

Unsupported extensions should fail clearly in `new:file` rather than creating files with invalid syntax. Bulk backfill should ignore unsupported files.

Why this approach:

- It covers the primary client source files without guessing comment styles for other formats.
- It prevents accidental invalid headers in JSON, Markdown, CSS, fonts, images, and other asset formats.
- It keeps future extension support intentional.

Alternatives considered:

- Apply `//` headers to every text file: rejected because it would break formats such as JSON and Markdown.
- Support CSS and Markdown immediately: deferred until the team decides the expected comment format and whether those files need per-file headers.

### Treat generated API output as a deliberate exception or post-generation target

The generated RTK Query file must not be handled accidentally. Implementation should choose one of two explicit approaches:

- Exclude `src/redux/apis/generatedApi.ts` from bulk backfill and document that generated output is not manually headered.
- Or add a small post-generation step so `yarn generate-api` and `yarn generate-mcp-api` reapply the standard header after code generation.

The preferred initial path is to exclude the generated file from bulk backfill unless codegen can be made to preserve the header reliably.

Why this approach:

- It avoids creating a header that disappears the next time API code is regenerated.
- It makes the generated-source policy visible to contributors.
- It keeps codegen commands predictable.

Alternatives considered:

- Backfill `generatedApi.ts` with no codegen change: rejected because the header would be fragile.
- Editing generated output by hand: rejected because it conflicts with the generated file's lifecycle.

### Add a minimal `CONTRIBUTING.md`

The client should add a lightweight contributor guide that documents the expected contribution flow, validation commands, Apache 2.0 contribution terms, and file-header workflow. README should link to it from a short Contributing section.

Why this approach:

- It mirrors the backend and gives contributors one obvious place to find license and workflow expectations.
- It keeps README concise while still surfacing the important commands.
- It avoids introducing a heavy process for a governance-only change.

Alternatives considered:

- Keep all guidance in README: acceptable for very small projects but less discoverable as the client grows.
- Add CLA or DCO instructions: rejected because this change only establishes the repository license and lightweight workflow guidance.

## Risks / Trade-offs

- [Generated API header drift] -> Exclude generated files from bulk backfill or add a post-generation header step before applying headers to them.
- [Header support is too narrow] -> Start with the clearly supported TypeScript/JavaScript extensions and extend later with explicit comment styles.
- [Contributors bypass the helper scripts] -> Document the commands in both README and `CONTRIBUTING.md`.
- [Large header backfill creates noisy diffs] -> Keep the implementation task explicit and separate from tool creation so reviewers understand which files are mechanical.
- [Package metadata refresh changes lockfile unexpectedly] -> Only update `yarn.lock` if Yarn actually records root package license metadata for this project.

## Migration Plan

1. Add the root Apache 2.0 `LICENSE` file and package metadata.
2. Add README and `CONTRIBUTING.md` guidance using Yarn commands.
3. Add the header utility scripts and supported extension configuration.
4. Decide and implement generated API handling before running any bulk backfill.
5. Run the header backfill for supported non-generated source files.
6. Validate helper command behavior and run the repository's normal validation commands.

Rollback is straightforward before merge: revert the license artifacts, documentation, scripts, package metadata, and mechanical header changes.

## Open Questions

- Should generated RTK Query output be permanently excluded from per-file headers, or should the code generation scripts reapply the header automatically?
- Should CSS files receive a block-comment SPDX header in a later change?
- Should CI eventually check for missing headers on supported new files?
