## Why

The backend on port 3001 now accepts structured Test Scenario fields and independently editable steps, rejecting the client's existing authored Markdown requests. Client issue #87 must adopt this contract to restore compatible authoring while preserving the established project-scoped workflow.

## What Changes

- **BREAKING** Replace editable Markdown with title, separate summary details, objective, preconditions, test data, overall expected result, and notes.
- Support atomic creation with zero or more initial steps and dedicated persisted step append, edit, delete, and reorder actions.
- Display structured fields and ordered steps without a Markdown preview or raw source view; never submit or compute generated Markdown, hash, or format version.
- Preserve unrelated unsaved drafts across step operations and recover from rejected stale ordering through refetch and explicit retry.
- Adopt generated types/hooks and refresh project-scoped detail and summary caches after successful writes.
- Preserve protected routes, creator display, pagination, project isolation, request states, and exact-title scenario deletion.

## Capabilities

### New Capabilities

- `test-scenario-step-editing`: Initial step drafts and independent persisted step mutations with accessible ordering and failure recovery.

### Modified Capabilities

- `test-scenario-authoring`: Structured creation, partial field editing, validation, structured scenario presentation, and draft-safe response handling replace Markdown authoring.

## Impact

Source: https://github.com/VENTIONINC/TestPortal-client/issues/87 under parent #88; backend dependency: https://github.com/VENTIONINC/TestPortal-backend/issues/89 under parent #92.

Affected areas: generated RTK Query API, authoring schemas and payload utilities, scenario form/containers/detail hook and presentation, cache integration, and mirrored tests under `src/__tests__/`. No new runtime dependency is planned.

The initial sync commit already contains the regenerated API and canonical specs. Seven known TypeScript errors remain in existing Markdown consumers and fixtures; resolving them belongs to implementation. Preserve the existing summary behavior from #85 without repeating its unfinished administrative checklist or reverting the synced canonical specs.

Backend changes, browser MCP integration, Markdown import/source editing, Spec-link/evidence UI, manual runs, suites/plans, revision history, autosave, optimistic concurrency resolution, exports, and legacy conversion are out of scope.
